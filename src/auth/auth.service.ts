import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Get or create default USER role
    const userRole = await this.prisma.role.upsert({
      where: {
        name: 'USER',
      },
      update: {},
      create: {
        name: 'USER',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: userRole.id,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userRole.name,
      },
    };
  }

  // =========================
  // LOGIN
  // =========================
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const validPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // Access token
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Refresh token
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    // Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      10,
    );

    await this.prisma.session.create({
      data: {
        refreshToken: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    };
  }

  // =========================
  // REFRESH ACCESS TOKEN
  // =========================
  async refresh(refreshToken: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // Find active sessions belonging to this user
    const sessions = await this.prisma.session.findMany({
      where: {
        userId: payload.sub,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    let validSession = null;

    for (const session of sessions) {
      const matches = await bcrypt.compare(
        refreshToken,
        session.refreshToken,
      );

      if (matches) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new UnauthorizedException(
        'Session not found',
      );
    }

    // Fetch user including normalized Role relation
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Create new access token
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      accessToken,
    };
  }

  // =========================
  // LOGOUT
  // =========================
  async logout(refreshToken: string) {
    let payload: any;

    try {
      payload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId: payload.sub,
      },
    });

    for (const session of sessions) {
      const matches = await bcrypt.compare(
        refreshToken,
        session.refreshToken,
      );

      if (matches) {
        await this.prisma.session.delete({
          where: {
            id: session.id,
          },
        });

        return {
          message: 'Logout successful',
        };
      }
    }

    throw new UnauthorizedException(
      'Invalid session',
    );
  }
}