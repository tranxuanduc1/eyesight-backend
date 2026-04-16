import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const { userId, role } = request.user;
    const id = parseInt(request.params.id, 10);

    if (userId !== id && role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
