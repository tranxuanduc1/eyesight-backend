import { Injectable } from '@nestjs/common';
import { Message } from '../../generated/prisma/client';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async createMessage(data: { chatId: number; content?: string }): Promise<Message> {
    return this.messageRepository.create(data.chatId, data.content);
  }

  async getMessageById(id: number): Promise<Message | null> {
    return this.messageRepository.findById(id);
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return this.messageRepository.findByChatId(chatId);
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageRepository.findAll();
  }

  async updateMessage(id: number, data: { content?: string }): Promise<Message> {
    return this.messageRepository.update(id, data);
  }

  async deleteMessage(id: number): Promise<Message> {
    return this.messageRepository.delete(id);
  }
}
