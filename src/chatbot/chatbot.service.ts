import { Injectable } from '@nestjs/common';
// import { Chat, Message } from '../../generated/prisma/client';
import prisma from '../../lib/db';

@Injectable()
export class ChatbotService {
  async createChat(data: { question:string }): Promise<object> {
    return { message: 'Chat created successfully'  };
  }
}