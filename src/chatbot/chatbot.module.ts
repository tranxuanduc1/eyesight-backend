import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { DrService } from './services/dr.service';
import { OcularService } from './services/ocular.service';
import { LlmService } from './services/llm.service';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
  imports: [AttachmentModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, DrService, OcularService, LlmService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
