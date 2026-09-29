import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    AuthModule,
    SubscriptionsModule,
    AiProvidersModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}