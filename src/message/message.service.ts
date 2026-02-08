import { Injectable } from '@nestjs/common';
import { Message } from '../../generated/prisma/client';
import prisma from '../../lib/db';

@Injectable()
export class MessageService {
  async createMessage(data: { 
    chatId: number; 
    content?: string; 
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
    mediaUrl?: string; 
    mediaType?: string;
    metadata?: object;
  }): Promise<Message> {
    return await prisma.message.create({
      data: {
        chatId: data.chatId,
        content: data.content,
        messageType: data.messageType,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        metadata: data.metadata,
      },
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getMessageById(id: number): Promise<Message | null> {
    return await prisma.message.findUnique({
      where: { id },
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { chatId },
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getAllMessages(): Promise<Message[]> {
    return await prisma.message.findMany({
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateMessage(id: number, data: { 
    content?: string; 
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
    mediaUrl?: string; 
    mediaType?: string;
    metadata?: object;
  }): Promise<Message> {
    return await prisma.message.update({
      where: { id },
      data,
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async deleteMessage(id: number): Promise<Message> {
    return await prisma.message.delete({
      where: { id },
      include: {
        chat: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}