import { Injectable } from '@nestjs/common';
import type { PrismaClient } from '../../generated/prisma/client';
import prisma from '../../lib/db';
import { AnalyticsRow, Interval } from '../common/analytics.helper';

type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const messageInclude = {
  chat: {
    include: {
      user: true,
    },
  },
  attachments: true,
};

@Injectable()
export class MessageRepository {
  create(chatId: number, content?: string) {
    return prisma.message.create({
      data: { chatId, content },
      include: messageInclude,
    });
  }

  createWithTx(tx: PrismaTx, chatId: number, content: string, isUser: boolean) {
    return tx.message.create({
      data: { chatId, content, is_belonging_to_user: isUser },
    });
  }

  findById(id: number) {
    return prisma.message.findUnique({
      where: { id },
      include: messageInclude,
    });
  }

  findByChatId(chatId: number) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: messageInclude,
    });
  }

  findAll() {
    return prisma.message.findMany({
      include: messageInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: number, data: { content?: string }) {
    return prisma.message.update({
      where: { id },
      data,
      include: messageInclude,
    });
  }

  delete(id: number) {
    return prisma.message.delete({
      where: { id },
      include: messageInclude,
    });
  }

  async analyticsMessageCount(start: Date, end: Date, interval: Interval): Promise<AnalyticsRow[]> {
    // interval is a validated union type ('day'|'week'|'month'), safe to inline
    const rows = await prisma.$queryRawUnsafe<{ bucket: Date; count: bigint }[]>(
      `SELECT
        DATE_TRUNC('${interval}', "createdAt") AS bucket,
        COUNT(*)::bigint                        AS count
       FROM "Message"
       WHERE "createdAt" >= $1
         AND "createdAt" <= $2
       GROUP BY bucket
       ORDER BY bucket ASC`,
      start,
      end,
    );
    return rows;
  }
}
