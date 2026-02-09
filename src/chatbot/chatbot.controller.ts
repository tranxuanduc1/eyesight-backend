import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
    async createChat(@Body() chatData: { question:string }): Promise<object> {
        return this.chatbotService.createChat(chatData);
    }
}