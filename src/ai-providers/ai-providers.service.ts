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
    ...dto,
    apiKey: this.encryptionService.encrypt(dto.apiKey),
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
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    return provider;
  }

  async update(id: string, dto: UpdateProviderDto) {
    await this.findOne(id);

    if (dto.isDefault === true) {
      await this.prisma.aiProvider.updateMany({
        where: {
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.aiProvider.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.aiProvider.delete({
      where: { id },
    });

    return {
      message: 'AI provider deleted successfully',
    };
  }
  private hideApiKey(provider: any) {
  const { apiKey, ...safeProvider } = provider;

  return {
    ...safeProvider,
    apiKeyConfigured: !!apiKey,
  };
}
}