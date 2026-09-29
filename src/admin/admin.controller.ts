import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

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

  @Get('health')
  health() {
    return this.adminService.health();
  }
}