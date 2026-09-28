import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiProvidersController } from './ai-providers.controller';
import { AiProvidersService } from './ai-providers.service';

@Module({
  imports: [AuthModule],
  controllers: [AiProvidersController],
  providers: [AiProvidersService],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}