import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      totalUsers,
      totalChats,
      totalSearches,
      totalProviders,
      premiumUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.chatHistory.count(),
      this.prisma.webSearch.count(),
      this.prisma.aiProvider.count(),
      this.prisma.subscription.count({
        where: { plan: 'PREMIUM' },
      }),
    ]);

    return {
      totalUsers,
      totalChats,
      totalSearches,
      totalProviders,
      premiumUsers,
    };
  }

  async users() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            requestLimit: true,
            requestsUsed: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async subscriptions() {
    return this.prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async providers() {
    const providers = await this.prisma.aiProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return providers.map(({ apiKey, ...provider }) => ({
      ...provider,
      apiKeyConfigured: !!apiKey,
    }));
  }

  async analytics() {
    const [
      chatRequests,
      webSearches,
      freeSubscriptions,
      premiumSubscriptions,
    ] = await Promise.all([
      this.prisma.chatHistory.count(),
      this.prisma.webSearch.count(),
      this.prisma.subscription.count({
        where: { plan: 'FREE' },
      }),
      this.prisma.subscription.count({
        where: { plan: 'PREMIUM' },
      }),
    ]);

    return {
      chatRequests,
      webSearches,
      subscriptions: {
        free: freeSubscriptions,
        premium: premiumSubscriptions,
      },
    };
  }

  async logs() {
    return this.prisma.apiUsageLog.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async health() {
    await this.prisma.user.count();

    return {
      status: 'OK',
      database: 'CONNECTED',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date(),
    };
  }
}