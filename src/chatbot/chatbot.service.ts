import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import prisma from '../../lib/db';
import type { PrismaClient } from '../../generated/prisma/client';

type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

interface DRResult {
  prediction: number;
  label: string;
  route: string;
  raw_outputs: Record<string, number | null>;
}

interface OcularResult {
  prediction: string;
  label: string;
  raw_outputs: Record<string, number>;
}

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatbotService {
  async *processMessage(params: {
    userId: number;
    chatId: number;
    prompt: string;
    rightEye?: Express.Multer.File;
    leftEye?: Express.Multer.File;
    age?: number;
    gender?: string;
  }): AsyncGenerator<object> {
    // 1. Validate chat exists and belongs to userId
    const chat = await prisma.chat.findUnique({ where: { id: params.chatId } });
    if (!chat || chat.userId !== params.userId) {
      throw new NotFoundException(`Chat ${params.chatId} not found`);
    }

    // 2. Load existing messages
    const existingMessages = await this.getMessages(params.chatId);

    // --- Phase 1: write files to disk ---
    const writtenPaths: string[] = [];
    const imagePaths: { left?: string; right?: string } = {};

    try {
      if (params.leftEye) {
        // Temp path using chatId; messageId not yet known — we store after tx
        const tmpPath = await this.storeImageTemp(params.leftEye, params.chatId, 'left');
        writtenPaths.push(tmpPath);
        imagePaths.left = tmpPath;
      }
      if (params.rightEye) {
        const tmpPath = await this.storeImageTemp(params.rightEye, params.chatId, 'right');
        writtenPaths.push(tmpPath);
        imagePaths.right = tmpPath;
      }
    } catch (err) {
      yield { type: 'error', message: `File storage error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 2: atomic DB write ---
    let userMessageId: number;
    try {
      const imageCombined = [imagePaths.left, imagePaths.right].filter(Boolean).join(',') || undefined;
      const patientInfo = [
        params.age !== undefined ? `Age: ${params.age}` : null,
        params.gender ? `Gender: ${params.gender}` : null,
      ]
        .filter(Boolean)
        .join(', ') || undefined;

      const result = await prisma.$transaction(async (tx) => {
        const userMsg = await this.saveMessage(tx, params.chatId, params.prompt, true);
        await this.saveAttachment(tx, userMsg.id, { image: imageCombined, content: patientInfo });
        return userMsg;
      });
      userMessageId = result.id;
    } catch (err) {
      // Compensating cleanup: remove written files
      for (const p of writtenPaths) {
        await fs.unlink(p).catch(() => {});
      }
      yield { type: 'error', message: `Database error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 3: model calls + streaming ---
    let drResult: DRResult | undefined;
    let ocularResult: OcularResult | undefined;
    let userMessageContent = params.prompt;

    if (params.rightEye || params.leftEye) {
      const drImage = params.rightEye ?? params.leftEye!;
      const ocularFiles = [params.rightEye, params.leftEye].filter(
        (f): f is Express.Multer.File => !!f,
      );

      try {
        [drResult, ocularResult] = await Promise.all([
          this.callDRService(drImage),
          this.callOcularService(ocularFiles, params.age, params.gender),
        ]);
      } catch (err) {
        yield { type: 'error', message: `Model service error: ${(err as Error).message}` };
        return;
      }

      yield { type: 'dr_result', data: drResult };
      yield { type: 'ocular_result', data: ocularResult };

      userMessageContent = this.buildEnrichedPrompt(
        params.prompt,
        drResult,
        ocularResult,
        params.age,
        params.gender,
      );
    }

    // Build LLM messages from history + new user message
    const llmMessages: LLMMessage[] = existingMessages.map((msg) => ({
      role: msg.is_belonging_to_user ? 'user' : 'assistant',
      content: msg.content ?? '',
    }));
    llmMessages.push({ role: 'user', content: userMessageContent });
    // Stream LLM response
    let fullResponse = '';
    try {
      for await (const token of this.streamLLM(llmMessages)) {
        fullResponse += token;
        yield { type: 'delta', delta: token };
      }
    } catch (err) {
      // Roll back the user message so the next retry starts fresh
      await prisma.message.delete({ where: { id: userMessageId } }).catch(() => {});
      yield { type: 'error', message: `LLM service error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 4: save system response ---
    if (fullResponse) {
      await prisma.$transaction(async (tx) => {
        const sysMsg = await this.saveMessage(tx, params.chatId, fullResponse, false);
        if (drResult && ocularResult) {
          await this.saveAttachment(tx, sysMsg.id, {
            content: JSON.stringify({ dr: drResult, ocular: ocularResult }),
          });
        }
      });
    }

    yield { type: 'done' };
  }

  private async storeImageTemp(
    file: Express.Multer.File,
    chatId: number,
    side: 'left' | 'right',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const filename = `${chatId}_${side}_${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), 'uploads', 'fundus');
    await fs.mkdir(dir, { recursive: true });
    const fullPath = path.join(dir, filename);
    await fs.writeFile(fullPath, file.buffer);
    return path.join('uploads', 'fundus', filename);
  }

  private async getMessages(chatId: number) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async saveMessage(tx: PrismaTx, chatId: number, content: string, isUser: boolean) {
    return tx.message.create({
      data: {
        chatId,
        content,
        is_belonging_to_user: isUser,
      },
    });
  }

  private async saveAttachment(
    tx: PrismaTx,
    messageId: number,
    opts: { image?: string; content?: string },
  ) {
    return tx.attachment.create({
      data: { messageId, image: opts.image, content: opts.content },
    });
  }

  private async callDRService(file: Express.Multer.File): Promise<DRResult> {
    const url = `${process.env.DR_MODEL_SERVICE_URL}/predict`;
    console.log('DR Service URL:', url);
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);

    const response = await fetch(url, { method: 'POST', body: form });
    console.log('DR Service response :', response);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return response.json() as Promise<DRResult>;
  }

  private async callOcularService(
    files: Express.Multer.File[],
    age?: number,
    gender?: string,
  ): Promise<OcularResult> {
    const url = `${process.env.OCULAR_MODEL_SERVICE_URL ?? 'http://localhost:8002'}/predict/`;
    console.log('Ocular Service URL:', url);
    const form = new FormData();
    for (const file of files) {
      form.append('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
    }
    if (age !== undefined) form.append('age', String(age));
    if (gender !== undefined) form.append('gender', gender);

    const response = await fetch(url, { method: 'POST', body: form });
    console.log('Ocular Service response :', response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return response.json() as Promise<OcularResult>;
  }

  private buildEnrichedPrompt(
    prompt: string,
    dr: DRResult,
    ocular: OcularResult,
    age?: number,
    gender?: string,
  ): string {
    const rawDR = Object.entries(dr.raw_outputs)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `${k}=${(v as number).toFixed(3)}`)
      .join(', ');

    const detectedDiseases = Object.entries(ocular.raw_outputs)
      .sort(([, a], [, b]) => b - a)
      .map(([code, prob]) => `${code}: ${(prob * 100).toFixed(1)}%`)
      .join(', ');

    const patientInfo = [
      age !== undefined ? `Age ${age}` : null,
      gender ? `Gender ${gender}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return [
      '[Medical Analysis]',
      `DR Assessment: Grade ${dr.prediction} – ${dr.label}`,
      `  Probabilities: ${rawDR}`,
      `Ocular Conditions: ${ocular.label || ocular.prediction} (${detectedDiseases})`,
      patientInfo ? `Patient: ${patientInfo}` : null,
      '',
      '---',
      `User: ${prompt}`,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  private async *streamLLM(messages: LLMMessage[]): AsyncGenerator<string> {
    console.log('LLM Service URL:', process.env.LLM_SERVICE_URL);
    console.log('LLM Request Messages:', messages);
    const url = `${process.env.LLM_SERVICE_URL ?? 'http://localhost:8001'}/generate/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    if (!response.body) {
      throw new Error('LLM service returned no response body');
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return;
        try {
          const parsed = JSON.parse(payload) as { delta: string };
          if (parsed.delta) yield parsed.delta;
        } catch {
          // skip malformed lines
        }
      }
    }

    // Flush remaining buffer
    if (buffer.startsWith('data: ')) {
      const payload = buffer.slice(6).trim();
      if (payload && payload !== '[DONE]') {
        try {
          const parsed = JSON.parse(payload) as { delta: string };
          if (parsed.delta) yield parsed.delta;
        } catch {
          // ignore
        }
      }
    }
  }
}
