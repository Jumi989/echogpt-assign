import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchDto {
  @ApiProperty({
    example: 'NestJS',
  })
  @IsString()
  @MinLength(2)
  query: string;
}