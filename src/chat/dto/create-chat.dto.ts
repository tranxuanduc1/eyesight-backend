import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;
}