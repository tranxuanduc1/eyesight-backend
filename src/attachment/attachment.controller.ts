import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createAttachment(@Body() dto: CreateAttachmentDto) {
    return this.attachmentService.createAttachment(dto);
  }

  @Get()
  getAttachments(@Query('messageId') messageId?: string) {
    if (messageId !== undefined) {
      return this.attachmentService.getAttachmentsByMessageId(parseInt(messageId, 10));
    }
    return this.attachmentService.getAllAttachments();
  }

  @Get(':id')
  getAttachmentById(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentService.getAttachmentById(id);
  }

  @Put(':id')
  updateAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttachmentDto,
  ) {
    return this.attachmentService.updateAttachment(id, dto);
  }

  @Delete(':id')
  deleteAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentService.deleteAttachment(id);
  }
}
