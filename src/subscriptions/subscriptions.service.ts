import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
          requestLimit: 20,
          requestsUsed: 0,
        },
      });
    }

    return {
      ...subscription,
      remainingRequests: Math.max(
        subscription.requestLimit - subscription.requestsUsed,
        0,
      ),
    };
  }

  async upgrade(userId: string) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: 'PREMIUM',
        status: 'ACTIVE',
        requestLimit: 500,
      },
      create: {
        userId,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        requestLimit: 500,
        requestsUsed: 0,
      },
    });

    return {
      message: 'Subscription upgraded to PREMIUM',
      subscription,
    };
  }

  async downgrade(userId: string) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: 'FREE',
        status: 'ACTIVE',
        requestLimit: 20,
      },
      create: {
        userId,
        plan: 'FREE',
        status: 'ACTIVE',
        requestLimit: 20,
        requestsUsed: 0,
      },
    });

    return {
      message: 'Subscription downgraded to FREE',
      subscription,
    };
  }

  async useRequest(userId: string) {
    const subscription = await this.getSubscription(userId);

    if (subscription.requestsUsed >= subscription.requestLimit) {
      return {
        allowed: false,
        message: 'Request limit reached',
        remainingRequests: 0,
      };
    }

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        requestsUsed: {
          increment: 1,
        },
      },
    });

    return {
      allowed: true,
      remainingRequests:
        updated.requestLimit - updated.requestsUsed,
    };
  }
}