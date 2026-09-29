import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.subscriptionsService.getSubscription(req.user.sub);
  }

  @Post('upgrade')
  upgrade(@Request() req: any) {
    return this.subscriptionsService.upgrade(req.user.sub);
  }

  @Post('downgrade')
  downgrade(@Request() req: any) {
    return this.subscriptionsService.downgrade(req.user.sub);
  }

  @Post('use-request')
  useRequest(@Request() req: any) {
    return this.subscriptionsService.useRequest(req.user.sub);
  }
}