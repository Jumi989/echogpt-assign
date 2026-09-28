import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}