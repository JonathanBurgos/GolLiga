import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.decorators.js';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service.js';

@ApiTags('Salud') @Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Public() @Get() @ApiOperation({ summary: 'Estado del API y conexión de base de datos' })
  async get() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  }
}
