import { config } from 'dotenv';
config()
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { AttachmentUrlInterceptor } from './common/interceptors/attachment-url.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('strict routing', false);
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new AttachmentUrlInterceptor());
  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://0.0.0.0:3000',
    'https://eyesight.blog',
    'https://www.eyesight.blog',
    'http://eyesight.blog',
    'http://www.eyesight.blog',

  ],
  credentials: true,
});
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
