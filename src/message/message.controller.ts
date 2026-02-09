import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from '../../generated/prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() messageData: { 
    chatId: number; 
    content?: string; 
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
    mediaUrl?: string; 
    mediaType?: string;
    metadata?: object;
  }): Promise<Message> {
    return this.messageService.createMessage(messageData);
  }

  @Get(':id')
  async getMessageById(@Param('id', ParseIntPipe) id: number): Promise<Message | null> {
    return this.messageService.getMessageById(id);
  }

  @Get()
  async getMessagesByChatId(@Query('chatId', ParseIntPipe) chatId: number): Promise<Message[]> {
    if (chatId) {
      return this.messageService.getMessagesByChatId(chatId);
    }
    return this.messageService.getAllMessages();
  }

  @Put(':id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() messageData: { 
      content?: string; 
      messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
      mediaUrl?: string; 
      mediaType?: string;
      metadata?: object;
    }
  ): Promise<Message> {
    return this.messageService.updateMessage(id, messageData);
  }

  @Delete(':id')
  async deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.messageService.deleteMessage(id);
  }
}