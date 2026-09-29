import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProviderDto {
  @ApiProperty({
    example: 'Gemini',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'your-api-key',
  })
  @IsString()
  @MinLength(3)
  apiKey: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}