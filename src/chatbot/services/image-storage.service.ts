import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImageStorageService {
  async storeImageTemp(
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
}
