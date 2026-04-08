import { Injectable } from '@nestjs/common';
import { Chat, Message } from '../../generated/prisma/client';
import prisma from '../../lib/db';

// Reusable include shapes — define once, use everywhere
const CHAT_INCLUDE = {
  user: true,
  messages: {
    orderBy: { createdAt: 'asc' as const },
    include: { attachments: true },
  },
} as const;

const MESSAGE_INCLUDE = {
  chat: { include: { user: true } },
  attachments: true,
} as const;

@Injectable()
export class ChatRepository {
  createChat(userId: number, title?: string): Promise<Chat> {
    return prisma.chat.create({
      data: { userId, title },
      include: CHAT_INCLUDE,
    });
  }

  findById(id: number): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { id },
      include: CHAT_INCLUDE,
    });
  }

  findAll(): Promise<Chat[]> {
    return prisma.chat.findMany({
      include: CHAT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUserId(userId: number): Promise<Chat[]> {
    return prisma.chat.findMany({
      where: { userId },
      include: CHAT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: number, title?: string): Promise<Chat> {
    return prisma.chat.update({
      where: { id },
      data: { title },
      include: CHAT_INCLUDE,
    });
  }

  delete(id: number): Promise<Chat> {
    return prisma.chat.delete({
      where: { id },
      include: CHAT_INCLUDE,
    });
  }

  createMessage(chatId: number, content?: string): Promise<Message> {
    return prisma.message.create({
      data: { chatId, content },
      include: MESSAGE_INCLUDE,
    });
  }

  findMessagesByChatId(chatId: number): Promise<Message[]> {
    return prisma.message.findMany({
      where: { chatId },
      include: MESSAGE_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }
}