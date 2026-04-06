import { Injectable } from '@nestjs/common';
import { Message } from '../../generated/prisma/client';
import prisma from '../../lib/db';

@Injectable()
export class MessageService {
  async createMessage(data: {
    chatId: number;
    content?: string;
  }): Promise<Message> {
    return await prisma.message.create({
      data: {
        chatId: data.chatId,
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

  async getMessageById(id: number): Promise<Message | null> {
    return await prisma.message.findUnique({
      where: { id },
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

  async getAllMessages(): Promise<Message[]> {
    return await prisma.message.findMany({
      include: {
        chat: {
          include: {
            user: true,
          },
        },
        attachment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateMessage(id: number, data: { content?: string }): Promise<Message> {
    return await prisma.message.update({
      where: { id },
      data,
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

  async deleteMessage(id: number): Promise<Message> {
    return await prisma.message.delete({
      where: { id },
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
}
