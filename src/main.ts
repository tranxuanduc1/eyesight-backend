import { config } from 'dotenv';
config()
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('strict routing', false);
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
