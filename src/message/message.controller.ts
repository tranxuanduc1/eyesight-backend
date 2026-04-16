import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, BadRequestException } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from '../../generated/prisma/client';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Interval } from '../common/analytics.helper';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() messageData: {
    chatId: number;
    content?: string;
  }): Promise<Message> {
    return this.messageService.createMessage(messageData);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('analytics')
  async getAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('interval') interval: string,
  ) {
    if (!start || !end || !interval) {
      throw new BadRequestException('start, end, and interval are required');
    }
    const validIntervals = ['day', 'week', 'month'];
    if (!validIntervals.includes(interval)) {
      throw new BadRequestException('interval must be one of: day, week, month');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setUTCHours(23, 59, 59, 999);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('start and end must be valid dates (YYYY-MM-DD)');
    }
    return this.messageService.getAnalytics(startDate, endDate, interval as Interval);
  }

  @Get(':id')
  async getMessageById(@Param('id', ParseIntPipe) id: number): Promise<Message | null> {
    return this.messageService.getMessageById(id);
  }

  @Get()
  async getMessagesByChatId(@Query('chatId', ParseIntPipe) chatId: number): Promise<Message[]> {
    if (chatId) {
      return this.messageService.getMessagesByChatId(chatId);
    }
    return this.messageService.getAllMessages();
  }

  @Put(':id')
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() messageData: { content?: string }
  ): Promise<Message> {
    return this.messageService.updateMessage(id, messageData);
  }

  @Delete(':id')
  async deleteMessage(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return this.messageService.deleteMessage(id);
  }
}
