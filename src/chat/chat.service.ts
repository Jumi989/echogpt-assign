import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async sendMessage(userId: string, dto: ChatDto) {
    const usage = await this.subscriptionsService.useRequest(userId);

    if (!usage.allowed) {
      throw new BadRequestException('Request limit reached');
    }

    let provider;

    if (dto.providerId) {
      provider = await this.prisma.aiProvider.findUnique({
        where: { id: dto.providerId },
      });
    } else {
      provider = await this.prisma.aiProvider.findFirst({
        where: {
          isDefault: true,
          enabled: true,
        },
      });
    }

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    if (!provider.enabled) {
      throw new BadRequestException('AI provider is disabled');
    }

    // Temporary response until real AI API integration
    const response = `AI response from ${provider.name}: ${dto.prompt}`;

    const chat = await this.prisma.chatHistory.create({
      data: {
        prompt: dto.prompt,
        response,
        providerName: provider.name,
        userId,
      },
    });

    return {
      ...chat,
      remainingRequests: usage.remainingRequests,
    };
  }

  async getHistory(userId: string) {
    return this.prisma.chatHistory.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}