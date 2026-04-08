import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { NotFoundException } from '@nestjs/common';

const mockRepo = {
  createChat: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createMessage: jest.fn(),
  findMessagesByChatId: jest.fn(),
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: ChatRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  it('should create a chat', async () => {
    mockRepo.createChat.mockResolvedValue({ id: 1, userId: 1, title: 'Test' });
    const result = await service.createChat({ userId: 1, title: 'Test' });
    expect(result).toEqual({ id: 1, userId: 1, title: 'Test' });
    expect(mockRepo.createChat).toHaveBeenCalledWith(1, 'Test');
  });

  it('should throw NotFoundException when chat not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getChatById(999)).rejects.toThrow(NotFoundException);
  });
});