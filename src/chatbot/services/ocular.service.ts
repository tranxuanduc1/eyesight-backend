import { Injectable } from '@nestjs/common';

export interface OcularResult {
  prediction: string;
  label: string;
  raw_outputs: Record<string, number>;
}

@Injectable()
export class OcularService {
  async predict(
    files: Express.Multer.File[],
    age?: number,
    gender?: string,
  ): Promise<OcularResult> {
    const url = `${process.env.OCULAR_MODEL_SERVICE_URL ?? 'http://localhost:8002'}/predict/`;
    const form = new FormData();
    for (const file of files) {
      form.append(
        'file',
        new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
        file.originalname,
      );
    }
    if (age !== undefined) form.append('age', String(age));
    if (gender !== undefined) form.append('gender', gender);

    const response = await fetch(url, { method: 'POST', body: form });
    if (!response.ok) {
      throw new Error(`Ocular service HTTP ${response.status}: ${await response.text()}`);
    }
    return response.json() as Promise<OcularResult>;
  }
}
