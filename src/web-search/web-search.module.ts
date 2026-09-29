import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WebSearchController } from './web-search.controller';
import { WebSearchService } from './web-search.service';

@Module({
  imports: [AuthModule],
  controllers: [WebSearchController],
  providers: [WebSearchService],
})
export class WebSearchModule {}