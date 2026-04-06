import { config } from 'dotenv';
config()
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://0.0.0.0:3000',
    'https://eyesight.app',
    'https://admin.eyesight.app',
  ],
  credentials: true,
});
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
