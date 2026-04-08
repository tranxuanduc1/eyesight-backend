import { Injectable } from '@nestjs/common';

export interface DRResult {
  prediction: number;
  label: string;
  route: string;
  raw_outputs: Record<string, number | null>;
}

@Injectable()
export class DrService {
  async predict(file: Express.Multer.File): Promise<DRResult> {
    const url = `${process.env.DR_MODEL_SERVICE_URL}/predict`;
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );

    const response = await fetch(url, { method: 'POST', body: form });
    if (!response.ok) {
      throw new Error(`DR service HTTP ${response.status}: ${await response.text()}`);
    }
    return response.json() as Promise<DRResult>;
  }
}
