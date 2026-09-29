import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(
    @Request() req: any,
    @Body() dto: ChatDto,
  ) {
    return this.chatService.sendMessage(req.user.sub, dto);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.chatService.getHistory(req.user.sub);
  }
}