import { Injectable } from '@nestjs/common';
import prisma from '../../lib/db';
import { AnalyticsRow, Interval } from '../common/analytics.helper';

@Injectable()
export class UserRepository {
  async analyticsActiveUsers(start: Date, end: Date, interval: Interval): Promise<AnalyticsRow[]> {
    // interval is a validated union type ('day'|'week'|'month'), safe to inline
    const rows = await prisma.$queryRawUnsafe<{ bucket: Date; count: bigint }[]>(
      `SELECT
        DATE_TRUNC('${interval}', m."createdAt") AS bucket,
        COUNT(DISTINCT c."userId")::bigint        AS count
       FROM "Message" m
       JOIN "Chat" c ON m."chatId" = c.id
       WHERE m."is_belonging_to_user" = true
         AND m."createdAt" >= $1
         AND m."createdAt" <= $2
       GROUP BY bucket
       ORDER BY bucket ASC`,
      start,
      end,
    );
    return rows;
  }
}
