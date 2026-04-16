import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { ChatOwnerOrAdminGuard } from '../auth/chat-owner-or-admin.guard';

@ApiTags('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createChat(@Body() dto: CreateChatDto) {
    return this.chatService.createChat(dto);
  }

  @Get(':id')
  getChatById(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.getChatById(id);
  }

  @Get()
  getAllChats() {
    return this.chatService.getAllChats();
  }

  @Get('user/:userId')
  getChatsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getChatsByUserId(userId);
  }

  @Put(':id')
  updateChat(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChatDto,
  ) {
    return this.chatService.updateChat(id, dto);
  }
  
  @UseGuards(ChatOwnerOrAdminGuard)
  @Delete(':id')
  deleteChat(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.deleteChat(id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  addMessageToChat(
    @Param('id', ParseIntPipe) chatId: number,
    @Body() dto: AddMessageDto,
  ) {
    return this.chatService.addMessageToChat(chatId, dto);
  }

  @Get(':id/messages')
  getMessagesByChatId(@Param('id', ParseIntPipe) chatId: number) {
    return this.chatService.getMessagesByChatId(chatId);
  }
}