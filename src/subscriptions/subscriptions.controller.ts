import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/swagger/swagger.decorators';

@ApiTags('Subscriptions')
@ApiProtected()
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