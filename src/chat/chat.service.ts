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
          include: {
            attachment: true,
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
          include: {
            attachment: true,
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
          include: {
            attachment: true,
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
        messages: {
          include: {
            attachment: true,
          },
        },
      },
    });
  }

  async deleteChat(id: number): Promise<Chat> {
    return await prisma.chat.delete({
      where: { id },
      include: {
        user: true,
        messages: {
          include: {
            attachment: true,
          },
        },
      },
    });
  }

  async addMessageToChat(chatId: number, data: { content?: string }): Promise<Message> {
    return await prisma.message.create({
      data: {
        chatId,
        content: data.content,
      },
      include: {
        chat: {
          include: {
            user: true,
          },
        },
        attachment: true,
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
        attachment: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
