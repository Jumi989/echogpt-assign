import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiAdminProtected } from '../common/swagger/swagger.decorators';
@ApiTags('Admin')
@ApiAdminProtected()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('users')
  users() {
    return this.adminService.users();
  }

  @Get('subscriptions')
  subscriptions() {
    return this.adminService.subscriptions();
  }

  @Get('providers')
  providers() {
    return this.adminService.providers();
  }

  @Get('analytics')
  analytics() {
    return this.adminService.analytics();
  }

  @Get('logs')
  logs() {
    return this.adminService.logs();
  }

  @ApiOkResponse({
  description: 'System health information',
  schema: {
    example: {
      status: 'OK',
      database: 'CONNECTED',
      uptimeSeconds: 120,
      timestamp: '2026-09-29T15:30:46.350Z',
    },
  },
})
  @Get('health')
  health() {
    return this.adminService.health();
  }
}