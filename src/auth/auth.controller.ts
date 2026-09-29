import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('auth')
@ApiBearerAuth()
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOkResponse({
  description: 'User logged in successfully',
  schema: {
    example: {
      message: 'Login successful',
      accessToken: 'eyJ...',
      refreshToken: 'eyJ...',
      user: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'Example User',
        role: 'USER',
      },
    },
  },
})
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Get('me')
getProfile(@Request() req: any) {
  return req.user;
}
}