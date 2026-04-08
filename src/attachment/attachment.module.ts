import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { AttachmentRepository } from './attachment.repository';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, AttachmentRepository],
  exports: [AttachmentService, AttachmentRepository],
})
export class AttachmentModule {}
