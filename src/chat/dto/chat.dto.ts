import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(1)
  prompt: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}