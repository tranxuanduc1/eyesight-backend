import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
}