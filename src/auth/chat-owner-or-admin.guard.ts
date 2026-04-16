import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import prisma from '../../lib/db';

@Injectable()
export class ChatOwnerOrAdminGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();
    const { userId, role } = request.user;
    const chatId = parseInt(request.params.id, 10);

    if (role === 'ADMIN') return true;

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException(`Chat #${chatId} not found`);

    if (chat.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
