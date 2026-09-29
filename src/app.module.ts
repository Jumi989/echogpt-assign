import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AiProvidersModule } from './ai-providers/ai-providers.module';
import { ChatModule } from './chat/chat.module';
import { WebSearchModule } from './web-search/web-search.module';
import { AdminModule } from './admin/admin.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    AiProvidersModule,
    ChatModule,
    WebSearchModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
  AppService,
  {
    provide: APP_INTERCEPTOR,
    useClass: RequestLoggingInterceptor,
  },
],
})
export class AppModule {}