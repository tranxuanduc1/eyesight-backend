import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class ImageStorageService {
  async storeImageTemp(
    file: Express.Multer.File,
    chatId: number,
    side: 'left' | 'right',
  ): Promise<string> {
    const publicId = `${chatId}_${side}_${Date.now()}`;
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: 'eyesight/fundus', public_id: publicId },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          )
          .end(file.buffer);
      },
    );
    return result.secure_url;
  }
}
