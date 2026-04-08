import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { DrService } from './services/dr.service';
import { OcularService } from './services/ocular.service';
import { LlmService } from './services/llm.service';
import { ImageStorageService } from './services/image-storage.service';
import { AttachmentModule } from '../attachment/attachment.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [AttachmentModule, MessageModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, DrService, OcularService, LlmService, ImageStorageService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
