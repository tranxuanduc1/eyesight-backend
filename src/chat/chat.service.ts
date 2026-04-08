import { Injectable, NotFoundException } from '@nestjs/common';
import { Chat, Message } from '../../generated/prisma/client';
import { ChatRepository } from './chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  createChat(dto: CreateChatDto): Promise<Chat> {
    return this.chatRepository.createChat(dto.userId, dto.title);
  }

  async getChatById(id: number): Promise<Chat> {
    const chat = await this.chatRepository.findById(id);
    if (!chat) throw new NotFoundException(`Chat #${id} not found`);
    return chat;
  }

  getAllChats(): Promise<Chat[]> {
    return this.chatRepository.findAll();
  }

  getChatsByUserId(userId: number): Promise<Chat[]> {
    return this.chatRepository.findByUserId(userId);
  }

  updateChat(id: number, dto: UpdateChatDto): Promise<Chat> {
    return this.chatRepository.update(id, dto.title);
  }

  deleteChat(id: number): Promise<Chat> {
    return this.chatRepository.delete(id);
  }

  addMessageToChat(chatId: number, dto: AddMessageDto): Promise<Message> {
    return this.chatRepository.createMessage(chatId, dto.content);
  }

  getMessagesByChatId(chatId: number): Promise<Message[]> {
    return this.chatRepository.findMessagesByChatId(chatId);
  }
}