import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import prisma from '../../lib/db';
import { DrService } from './services/dr.service';
import type { DRResult } from './services/dr.service';
import { OcularService } from './services/ocular.service';
import type { OcularResult } from './services/ocular.service';
import { LlmService } from './services/llm.service';
import type { LLMMessage } from './services/llm.service';
import { AttachmentService } from '../attachment/attachment.service';
import { MessageRepository } from '../message/message.repository';
import { ImageStorageService } from './services/image-storage.service';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly drService: DrService,
    private readonly ocularService: OcularService,
    private readonly llmService: LlmService,
    private readonly attachmentService: AttachmentService,
    private readonly messageRepository: MessageRepository,
    private readonly imageStorageService: ImageStorageService,
  ) {}

  async *processMessage(params: {
    userId: number;
    chatId: number;
    prompt: string;
    rightEye?: Express.Multer.File;
    leftEye?: Express.Multer.File;
    age?: number;
    gender?: string;
  }): AsyncGenerator<object> {
    const hasImages = !!(params.rightEye || params.leftEye);
    const hasInfo = params.age !== undefined || !!params.gender;

    // 1. Validate chat exists and belongs to userId
    const chat = await prisma.chat.findUnique({ where: { id: params.chatId } });
    if (!chat || chat.userId !== params.userId) {
      throw new NotFoundException(`Chat ${params.chatId} not found`);
    }

    // 2. Load existing messages for LLM context
    const existingMessages = await this.messageRepository.findByChatId(params.chatId);

    // --- Phase 1: write fundus images to disk ---
    const writtenPaths: string[] = [];
    const imagePaths: { left?: string; right?: string } = {};

    try {
      if (params.leftEye) {
        const tmpPath = await this.imageStorageService.storeImageTemp(params.leftEye, params.chatId, 'left');
        writtenPaths.push(tmpPath);
        imagePaths.left = tmpPath;
      }
      if (params.rightEye) {
        const tmpPath = await this.imageStorageService.storeImageTemp(params.rightEye, params.chatId, 'right');
        writtenPaths.push(tmpPath);
        imagePaths.right = tmpPath;
      }
    } catch (err) {
      yield { type: 'error', message: `File storage error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 2: atomic DB write — user message + per-item attachments ---
    let userMessageId: number;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const userMsg = await this.messageRepository.createWithTx(tx, params.chatId, params.prompt, true);

        // Attachment 1: patient info (JSON) if provided
        if (hasInfo) {
          await this.attachmentService.createWithTx(tx, userMsg.id, {
            content: JSON.stringify({ age: params.age, gender: params.gender }),
          });
        }

        // Attachment 2: left fundus image if provided
        if (imagePaths.left) {
          await this.attachmentService.createWithTx(tx, userMsg.id, { image: imagePaths.left });
        }

        // Attachment 3: right fundus image if provided
        if (imagePaths.right) {
          await this.attachmentService.createWithTx(tx, userMsg.id, { image: imagePaths.right });
        }

        return userMsg;
      });
      userMessageId = result.id;
    } catch (err) {
      for (const p of writtenPaths) {
        await fs.unlink(p).catch(() => {});
      }
      yield { type: 'error', message: `Database error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 3: model calls based on routing matrix ---
    let drResult: DRResult | undefined;
    let ocularResult: OcularResult | undefined;
    let userMessageContent = params.prompt;

    if (hasImages) {
      const drImage = params.rightEye ?? params.leftEye!;
      const ocularFiles = [params.rightEye, params.leftEye].filter(
        (f): f is Express.Multer.File => !!f,
      );

      try {
        if (hasInfo) {
          // Images + patient info → call DR and Ocular in parallel
          [drResult, ocularResult] = await Promise.all([
            this.drService.predict(drImage),
            this.ocularService.predict(ocularFiles, params.age, params.gender),
          ]);
        } else {
          // Images only → call DR only
          drResult = await this.drService.predict(drImage);
        }
      } catch (err) {
        yield { type: 'error', message: `Model service error: ${(err as Error).message}` };
        return;
      }

      yield { type: 'dr_result', data: drResult };
      if (ocularResult) yield { type: 'ocular_result', data: ocularResult };

      userMessageContent = this.llmService.buildEnrichedPrompt(
        params.prompt,
        drResult!,
        ocularResult,
        params.age,
        params.gender,
      );
    }

    // --- Phase 3b: stream LLM response ---
    const llmMessages: LLMMessage[] = existingMessages.map((msg) => {
      let content = msg.content ?? '';

      // For assistant messages, append the label from each JSON attachment that has one
      if (!msg.is_belonging_to_user && msg.attachments.length > 0) {
        for (const attachment of msg.attachments) {
          if (!attachment.content) continue;
          try {
            const parsed = JSON.parse(attachment.content) as { label?: string };
            if (parsed.label) content += `\n[label: ${parsed.label}]`;
          } catch {
            // skip malformed JSON attachments
          }
        }
      }

      return { role: msg.is_belonging_to_user ? 'user' : 'assistant', content };
    });
    llmMessages.push({ role: 'user', content: userMessageContent });

    let fullResponse = '';
    try {
      for await (const token of this.llmService.stream(llmMessages)) {
        fullResponse += token;
        yield { type: 'delta', delta: token };
      }
    } catch (err) {
      await prisma.message.delete({ where: { id: userMessageId } }).catch(() => {});
      yield { type: 'error', message: `LLM service error: ${(err as Error).message}` };
      return;
    }

    // --- Phase 4: save LLM response + model result attachments ---
    if (fullResponse) {
      await prisma.$transaction(async (tx) => {
        const sysMsg = await this.messageRepository.createWithTx(tx, params.chatId, fullResponse, false);

        // Attachment: DR result (JSON) if DR was called
        if (drResult) {
          await this.attachmentService.createWithTx(tx, sysMsg.id, {
            content: JSON.stringify(drResult),
          });
        }

        // Attachment: Ocular result (JSON) if Ocular was called
        if (ocularResult) {
          await this.attachmentService.createWithTx(tx, sysMsg.id, {
            content: JSON.stringify(ocularResult),
          });
        }
      });
    }

    yield { type: 'done' };
  }
}
