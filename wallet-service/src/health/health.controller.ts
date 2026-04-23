import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'wallet-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('ready')
  ready() {
    return {
      status: 'ready',
      service: 'wallet-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  live() {
    return {
      status: 'alive',
      service: 'wallet-service',
      timestamp: new Date().toISOString(),
    };
  }
} 