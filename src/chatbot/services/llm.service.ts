import { Injectable } from '@nestjs/common';
import type { DRResult } from './dr.service';
import type { OcularResult } from './ocular.service';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class LlmService {
  async *stream(messages: LLMMessage[]): AsyncGenerator<string> {
    const url = `${process.env.LLM_SERVICE_URL ?? 'http://localhost:8003'}/generate/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`LLM service HTTP ${response.status}: ${await response.text()}`);
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

  buildEnrichedPrompt(
    prompt: string,
    dr: DRResult,
    ocular?: OcularResult,
    age?: number,
    gender?: string,
  ): string {
    const rawDR = Object.entries(dr.raw_outputs)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `${k}=${(v as number).toFixed(3)}`)
      .join(', ');

    const patientInfo = [
      age !== undefined ? `Age ${age}` : null,
      gender ? `Gender ${gender}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const lines: (string | null)[] = [
      '[Medical Analysis]',
      `DR Assessment: Grade ${dr.prediction} – ${dr.label}`,
      `  Probabilities: ${rawDR}`,
    ];

    if (ocular) {
      const detectedDiseases = Object.entries(ocular.raw_outputs)
        .sort(([, a], [, b]) => b - a)
        .map(([code, prob]) => `${code}: ${(prob * 100).toFixed(1)}%`)
        .join(', ');
      lines.push(`Ocular Conditions: ${ocular.label || ocular.prediction} (${detectedDiseases})`);
    }

    if (patientInfo) lines.push(`Patient: ${patientInfo}`);
    lines.push('', '---', `User: ${prompt}`);

    return lines.filter((line) => line !== null).join('\n');
  }
}
