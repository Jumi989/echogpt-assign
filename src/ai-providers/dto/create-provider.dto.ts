import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(3)
  apiKey: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}