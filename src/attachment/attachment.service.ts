import { Injectable, NotFoundException } from '@nestjs/common';
import { AttachmentRepository } from './attachment.repository';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Injectable()
export class AttachmentService {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  createAttachment(dto: CreateAttachmentDto) {
    return this.attachmentRepository.create(dto.messageId, {
      content: dto.content,
      image: dto.image,
    });
  }

  async getAttachmentById(id: number) {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) throw new NotFoundException(`Attachment #${id} not found`);
    return attachment;
  }

  getAllAttachments() {
    return this.attachmentRepository.findAll();
  }

  getAttachmentsByMessageId(messageId: number) {
    return this.attachmentRepository.findByMessageId(messageId);
  }

  updateAttachment(id: number, dto: UpdateAttachmentDto) {
    return this.attachmentRepository.update(id, {
      content: dto.content,
      image: dto.image,
    });
  }

  deleteAttachment(id: number) {
    return this.attachmentRepository.delete(id);
  }
}
