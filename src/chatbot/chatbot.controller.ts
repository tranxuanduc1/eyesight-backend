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
    @Body()
    body: { chat_id: string; prompt: string; age?: string; gender?: string },
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Pre-SSE validation: return JSON errors before setting SSE headers
    if (!body.chat_id) {
      return res.status(400).json({ message: 'chat_id is required', error: 'Bad Request', statusCode: 400 });
    }
    const chatId = parseInt(body.chat_id, 10);
    if (isNaN(chatId)) {
      return res.status(400).json({ message: 'chat_id must be a number', error: 'Bad Request', statusCode: 400 });
    }
    if (!body.prompt) {
      return res.status(400).json({ message: 'prompt is required', error: 'Bad Request', statusCode: 400 });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const userId: number = req.user.userId;
    const age = body.age ? parseFloat(body.age) : undefined;

    try {
      const generator = this.chatbotService.processMessage({
        userId,
        chatId,
        prompt: body.prompt,
        rightEye: files?.fundus_right?.[0],
        leftEye: files?.fundus_left?.[0],
        age,
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
