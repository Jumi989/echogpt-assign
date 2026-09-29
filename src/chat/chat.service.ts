import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly aiProvidersService: AiProvidersService,
  ) {}

  async sendMessage(userId: string, dto: ChatDto) {
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

    const subscription =
      await this.subscriptionsService.getSubscription(userId);

    if (
      subscription.requestsUsed >=
      subscription.requestLimit
    ) {
      throw new BadRequestException('Request limit reached');
    }

    if (provider.name.toLowerCase() !== 'gemini') {
      throw new BadRequestException(
        `${provider.name} API integration is not configured yet`,
      );
    }

    const apiKey =
      await this.aiProvidersService.getDecryptedApiKey(
        provider.id,
      );

    let response: string;

    try {
      const ai = new GoogleGenAI({
        apiKey,
      });

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: dto.prompt,
      });

      response = result.text?.trim() || 'No response generated';
    } catch (error: any) {
      console.error(
        'Gemini API error:',
        error?.message || error,
      );

      throw new BadGatewayException(
        'Failed to get response from Gemini',
      );
    }

    const usage =
      await this.subscriptionsService.useRequest(userId);

    const chat = await this.prisma.chatHistory.create({
      data: {
        prompt: dto.prompt,
        response,
        providerName: provider.name,
        userId,
      },
    });

    await this.prisma.apiUsageLog.create({
  data: {
    userId,
    action: 'CHAT',
    provider: provider.name,
    status: 'SUCCESS',
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