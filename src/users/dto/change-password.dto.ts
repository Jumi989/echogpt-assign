import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}