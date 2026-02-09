import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, Message } from '../../generated/prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() chatData: { userId: number; title?: string }): Promise<Chat> {
    return this.chatService.createChat(chatData);
  }

  @Get(':id')
  async getChatById(@Param('id', ParseIntPipe) id: number): Promise<Chat | null> {
    return this.chatService.getChatById(id);
  }

  @Get()
  async getAllChats(): Promise<Chat[]> {
    return this.chatService.getAllChats();
  }

  @Get('user/:userId')
  async getChatsByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Chat[]> {
    return this.chatService.getChatsByUserId(userId);
  }

  @Put(':id')
  async updateChat(
    @Param('id', ParseIntPipe) id: number,
    @Body() chatData: { title?: string }
  ): Promise<Chat> {
    return this.chatService.updateChat(id, chatData);
  }

  @Delete(':id')
  async deleteChat(@Param('id', ParseIntPipe) id: number): Promise<Chat> {
    return this.chatService.deleteChat(id);
  }

  @Post(':id/messages')
  async addMessageToChat(
    @Param('id', ParseIntPipe) chatId: number,
    @Body() messageData: { 
      content?: string; 
      messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
      mediaUrl?: string; 
      mediaType?: string;
      metadata?: object;
    }
  ): Promise<Message> {
    return this.chatService.addMessageToChat(chatId, messageData);
  }

  @Get(':id/messages')
  async getMessagesByChatId(@Param('id', ParseIntPipe) chatId: number): Promise<Message[]> {
    return this.chatService.getMessagesByChatId(chatId);
  }
}