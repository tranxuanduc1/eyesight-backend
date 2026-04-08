import { Injectable } from '@nestjs/common';
import type { PrismaClient } from '../../generated/prisma/client';
import prisma from '../../lib/db';

type PrismaTx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const ATTACHMENT_INCLUDE = {
  message: true,
} as const;

@Injectable()
export class AttachmentRepository {
  create(messageId: number, data: { content?: string; image?: string }) {
    return prisma.attachment.create({
      data: { messageId, ...data },
      include: ATTACHMENT_INCLUDE,
    });
  }

  findById(id: number) {
    return prisma.attachment.findUnique({
      where: { id },
      include: ATTACHMENT_INCLUDE,
    });
  }

  findAll() {
    return prisma.attachment.findMany({
      include: ATTACHMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByMessageId(messageId: number) {
    return prisma.attachment.findMany({
      where: { messageId },
      include: ATTACHMENT_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  }

  update(id: number, data: { content?: string; image?: string }) {
    return prisma.attachment.update({
      where: { id },
      data,
      include: ATTACHMENT_INCLUDE,
    });
  }

  delete(id: number) {
    return prisma.attachment.delete({
      where: { id },
      include: ATTACHMENT_INCLUDE,
    });
  }

  createWithTx(tx: PrismaTx, messageId: number, data: { content?: string; image?: string }) {
    return tx.attachment.create({
      data: { messageId, ...data },
      include: ATTACHMENT_INCLUDE,
    });
  }
}
