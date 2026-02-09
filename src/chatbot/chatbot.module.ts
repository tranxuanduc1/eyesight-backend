import { Module } from '@nestjs/common';
import { ChatController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  controllers: [ChatController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}