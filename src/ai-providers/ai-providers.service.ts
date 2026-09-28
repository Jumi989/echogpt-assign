import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { EncryptionService } from './encryption.service';

@Injectable()
export class AiProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private hideApiKey(provider: any) {
    const { apiKey, ...safeProvider } = provider;

    return {
      ...safeProvider,
      apiKeyConfigured: !!apiKey,
    };
  }

  private async getRawProvider(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    return provider;
  }

  async create(dto: CreateProviderDto) {
    const existing = await this.prisma.aiProvider.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Provider already exists');
    }

    if (dto.isDefault) {
      await this.prisma.aiProvider.updateMany({
        data: { isDefault: false },
      });
    }

    const provider = await this.prisma.aiProvider.create({
      data: {
        name: dto.name,
        apiKey: this.encryptionService.encrypt(dto.apiKey),
        enabled: dto.enabled ?? true,
        isDefault: dto.isDefault ?? false,
      },
    });

    return this.hideApiKey(provider);
  }

  async findAll() {
    const providers = await this.prisma.aiProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return providers.map((provider) => this.hideApiKey(provider));
  }

  async findOne(id: string) {
    const provider = await this.getRawProvider(id);
    return this.hideApiKey(provider);
  }

  async update(id: string, dto: UpdateProviderDto) {
    await this.getRawProvider(id);

    if (dto.name) {
      const existing = await this.prisma.aiProvider.findUnique({
        where: { name: dto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Provider name already exists');
      }
    }

    if (dto.isDefault === true) {
      await this.prisma.aiProvider.updateMany({
        data: { isDefault: false },
      });
    }

    const provider = await this.prisma.aiProvider.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.isDefault !== undefined && {
          isDefault: dto.isDefault,
        }),
        ...(dto.apiKey !== undefined && {
          apiKey: this.encryptionService.encrypt(dto.apiKey),
        }),
      },
    });

    return this.hideApiKey(provider);
  }

  async enable(id: string) {
    await this.getRawProvider(id);

    const provider = await this.prisma.aiProvider.update({
      where: { id },
      data: { enabled: true },
    });

    return {
      message: 'Provider enabled successfully',
      provider: this.hideApiKey(provider),
    };
  }

  async disable(id: string) {
    const existing = await this.getRawProvider(id);

    const provider = await this.prisma.aiProvider.update({
      where: { id },
      data: {
        enabled: false,
        isDefault: existing.isDefault ? false : existing.isDefault,
      },
    });

    return {
      message: 'Provider disabled successfully',
      provider: this.hideApiKey(provider),
    };
  }

  async setDefault(id: string) {
    await this.getRawProvider(id);

    await this.prisma.aiProvider.updateMany({
      data: { isDefault: false },
    });

    const provider = await this.prisma.aiProvider.update({
      where: { id },
      data: {
        isDefault: true,
        enabled: true,
      },
    });

    return {
      message: 'Default provider updated successfully',
      provider: this.hideApiKey(provider),
    };
  }

  async healthCheck(id: string) {
    const provider = await this.getRawProvider(id);

    if (!provider.enabled) {
      return {
        provider: provider.name,
        status: 'DISABLED',
        healthy: false,
      };
    }

    try {
      const apiKey = this.encryptionService.decrypt(provider.apiKey);

      return {
        provider: provider.name,
        status: apiKey ? 'HEALTHY' : 'UNHEALTHY',
        healthy: !!apiKey,
        apiKeyConfigured: !!apiKey,
      };
    } catch {
      return {
        provider: provider.name,
        status: 'UNHEALTHY',
        healthy: false,
        apiKeyConfigured: false,
      };
    }
  }

  async getDecryptedApiKey(id: string) {
    const provider = await this.getRawProvider(id);

    return this.encryptionService.decrypt(provider.apiKey);
  }

  async remove(id: string) {
    await this.getRawProvider(id);

    await this.prisma.aiProvider.delete({
      where: { id },
    });

    return {
      message: 'AI provider deleted successfully',
    };
  }
}