import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AiProvidersService } from './ai-providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiAdminProtected } from '../common/swagger/swagger.decorators';
@ApiTags('AI Providers')
@ApiAdminProtected()
@Controller('ai-providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AiProvidersController {
  constructor(
    private readonly aiProvidersService: AiProvidersService,
  ) {}

  @Post()
  create(@Body() dto: CreateProviderDto) {
    return this.aiProvidersService.create(dto);
  }

  @Get()
  findAll() {
    return this.aiProvidersService.findAll();
  }

  @Patch(':id/enable')
  enable(@Param('id') id: string) {
    return this.aiProvidersService.enable(id);
  }

  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return this.aiProvidersService.disable(id);
  }

  @Patch(':id/default')
  setDefault(@Param('id') id: string) {
    return this.aiProvidersService.setDefault(id);
  }
@ApiOkResponse({
  description: 'AI provider health status',
  schema: {
    example: {
      provider: 'Gemini',
      status: 'HEALTHY',
      healthy: true,
      statusCode: 200,
      responseTimeMs: 350,
      apiKeyConfigured: true,
    },
  },
})
  @Get(':id/health')
  health(@Param('id') id: string) {
    return this.aiProvidersService.healthCheck(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiProvidersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.aiProvidersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiProvidersService.remove(id);
  }
}