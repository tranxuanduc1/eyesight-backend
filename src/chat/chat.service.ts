import { Injectable } from '@nestjs/common';
import { Chat, Message } from '../../generated/prisma/client';
import prisma from '../../lib/db';

@Injectable()
export class ChatService {
  async createChat(data: { userId: number; title?: string }): Promise<Chat> {
    return await prisma.chat.create({
      data,
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async getChatById(id: number): Promise<Chat | null> {
    return await prisma.chat.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async getAllChats(): Promise<Chat[]> {
    return await prisma.chat.findMany({
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return await prisma.chat.findMany({
      where: { userId },
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateChat(id: number, data: { title?: string }): Promise<Chat> {
    return await prisma.chat.update({
      where: { id },
      data,
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async deleteChat(id: number): Promise<Chat> {
    return await prisma.chat.delete({
      where: { id },
      include: {
        user: true,
        messages: true,
      },
    });
  }

  async addMessageToChat(chatId: number, data: { 
    content?: string; 
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'; 
    mediaUrl?: string; 
    mediaType?: string;
    metadata?: object;
  }): Promise<Message> {
    return await prisma.message.create({
      data: {
        chatId,
        ...data,
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
}