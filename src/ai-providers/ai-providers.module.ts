import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiProvidersController } from './ai-providers.controller';
import { AiProvidersService } from './ai-providers.service';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [AuthModule],
  controllers: [AiProvidersController],
  providers: [AiProvidersService, EncryptionService],
  exports: [AiProvidersService, EncryptionService],
})
export class AiProvidersModule {}