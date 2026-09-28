import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class AiProvidersService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.aiProvider.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.aiProvider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
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
}