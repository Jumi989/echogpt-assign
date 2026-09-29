import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchDto } from './dto/search.dto';
import { WebSearchService } from './web-search.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Web Search')
@ApiBearerAuth()
@Controller('web-search')
@UseGuards(JwtAuthGuard)
export class WebSearchController {
  constructor(
    private readonly webSearchService: WebSearchService,
  ) {}

  @Post()
  search(
    @Request() req: any,
    @Body() dto: SearchDto,
  ) {
    return this.webSearchService.search(
      req.user.sub,
      dto.query,
    );
  }

  @Get('history')
  history(@Request() req: any) {
    return this.webSearchService.getHistory(req.user.sub);
  }

  @Get('recent')
  recent(@Request() req: any) {
    return this.webSearchService.getRecent(req.user.sub);
  }

  @Get('suggestions')
  suggestions(
    @Request() req: any,
    @Query('q') q: string,
  ) {
    return this.webSearchService.getSuggestions(
      req.user.sub,
      q,
    );
  }
}