import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fundus_right', maxCount: 1 },
      { name: 'fundus_left', maxCount: 1 },
    ]),
  )
  async message(
    @UploadedFiles()
    files: { fundus_right?: Express.Multer.File[]; fundus_left?: Express.Multer.File[] },
    @Body() body: ChatbotMessageDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Pre-SSE validation: info patient without images is invalid
    const hasImages = !!(files?.fundus_right?.[0] || files?.fundus_left?.[0]);
    const hasInfo = body.age !== undefined || !!body.gender;
    if (hasInfo && !hasImages) {
      return res.status(400).json({
        message: 'Patient info (age/gender) requires at least one fundus image',
        error: 'Bad Request',
        statusCode: 400,
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userId: number = req.user.userId;

    try {
      const generator = this.chatbotService.processMessage({
        userId,
        chatId: body.chat_id,
        prompt: body.prompt,
        rightEye: files?.fundus_right?.[0],
        leftEye: files?.fundus_left?.[0],
        age: body.age,
        gender: body.gender,
      });

      for await (const event of generator) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: (err as Error).message })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
