import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

jest.mock('../../lib/db', () => ({
  __esModule: true,
  default: {
    chat: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import prisma from '../../lib/db';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a chat', async () => {
      const mockChat = { id: 1, userId: 1, title: 'Test' };
      (mockPrisma.chat.create as jest.Mock).mockResolvedValue(mockChat);

      const result = await service.createChat({ userId: 1, title: 'Test' });

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.create).toHaveBeenCalledWith({
        data: { userId: 1, title: 'Test' },
        include: { user: true, messages: true },
      });
    });
  });

  describe('getChatById', () => {
    it('should return a chat by id', async () => {
      const mockChat = { id: 1, userId: 1 };
      (mockPrisma.chat.findUnique as jest.Mock).mockResolvedValue(mockChat);

      const result = await service.getChatById(1);

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: true,
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    });

    it('should return null if chat not found', async () => {
      (mockPrisma.chat.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getChatById(999);

      expect(result).toBeNull();
    });
  });

  describe('getAllChats', () => {
    it('should return all chats', async () => {
      const mockChats = [{ id: 1 }, { id: 2 }];
      (mockPrisma.chat.findMany as jest.Mock).mockResolvedValue(mockChats);

      const result = await service.getAllChats();

      expect(result).toEqual(mockChats);
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        include: {
          user: true,
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getChatsByUserId', () => {
    it('should return chats for a user', async () => {
      const mockChats = [{ id: 1, userId: 1 }];
      (mockPrisma.chat.findMany as jest.Mock).mockResolvedValue(mockChats);

      const result = await service.getChatsByUserId(1);

      expect(result).toEqual(mockChats);
      expect(mockPrisma.chat.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          user: true,
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateChat', () => {
    it('should update a chat', async () => {
      const mockChat = { id: 1, title: 'Updated' };
      (mockPrisma.chat.update as jest.Mock).mockResolvedValue(mockChat);

      const result = await service.updateChat(1, { title: 'Updated' });

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated' },
        include: { user: true, messages: true },
      });
    });
  });

  describe('deleteChat', () => {
    it('should delete a chat', async () => {
      const mockChat = { id: 1 };
      (mockPrisma.chat.delete as jest.Mock).mockResolvedValue(mockChat);

      const result = await service.deleteChat(1);

      expect(result).toEqual(mockChat);
      expect(mockPrisma.chat.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true, messages: true },
      });
    });
  });

  describe('addMessageToChat', () => {
    it('should add a text message to a chat', async () => {
      const mockMessage = { id: 1, chatId: 1, content: 'Hello' };
      (mockPrisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await service.addMessageToChat(1, { content: 'Hello' });

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: { chatId: 1, content: 'Hello' },
        include: { chat: { include: { user: true } } },
      });
    });

    it('should add a message with content', async () => {
      const mockMessage = { id: 1, chatId: 1, content: 'Hello with content' };
      (mockPrisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await service.addMessageToChat(1, {
        content: 'Hello with content',
      });

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: {
          chatId: 1,
          content: 'Hello with content',
        },
        include: { chat: { include: { user: true } }, attachment: true },
      });
    });
  });

  describe('getMessagesByChatId', () => {
    it('should return messages for a chat', async () => {
      const mockMessages = [{ id: 1, chatId: 1 }, { id: 2, chatId: 1 }];
      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await service.getMessagesByChatId(1);

      expect(result).toEqual(mockMessages);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: { chatId: 1 },
        include: { chat: { include: { user: true } } },
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});
