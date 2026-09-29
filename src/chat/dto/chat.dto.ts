import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({
    example: 'Explain blockchain in one simple sentence.',
  })
  @IsString()
  @MinLength(1)
  prompt: string;

  @ApiPropertyOptional({
    example: '4de75fc6-9ede-45c9-ae85-0ad9aa3e29f2',
  })
  @IsOptional()
  @IsString()
  providerId?: string;
}