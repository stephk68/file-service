import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { BootstrapService } from './shared/bootstrap.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly bootstrapService: BootstrapService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'file-service',
    };
  }

  @Post('bootstrap/reset')
  @ApiOperation({
    summary: 'Réinitialiser les credentials par défaut',
    description:
      '⚠️ ATTENTION: Cette action supprime et recrée tous les utilisateurs par défaut. À utiliser uniquement en développement!',
  })
  @ApiResponse({
    status: 200,
    description: 'Credentials réinitialisés avec succès',
    schema: {
      example: {
        message: 'Credentials par défaut réinitialisés',
        users: ['admin', 'user'],
        timestamp: '2025-11-12T10:00:00.000Z',
      },
    },
  })
  async resetBootstrap() {
    await this.bootstrapService.resetDefaultCredentials();
    return {
      message: 'Credentials par défaut réinitialisés',
      users: ['admin', 'user'],
      timestamp: new Date().toISOString(),
    };
  }
}
