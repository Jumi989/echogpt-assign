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
import { ApiProtected } from '../common/swagger/swagger.decorators';
import {
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Chat')
@ApiProtected()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOkResponse({
  description: 'AI response generated successfully',
  schema: {
    example: {
      id: 'uuid',
      prompt: 'Explain blockchain',
      response: 'Blockchain is a distributed digital ledger...',
      providerName: 'Gemini',
      remainingRequests: 17,
    },
  },
})

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