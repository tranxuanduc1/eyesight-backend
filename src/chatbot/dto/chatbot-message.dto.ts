import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatbotMessageDto {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  chat_id: number;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== '' ? parseFloat(value as string) : undefined,
  )
  @IsNumber()
  @Min(0)
  age?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;
}
