import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
// @ts-ignore
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: any;
  let typeOrmHealthIndicator: any;

  beforeEach(async () => {
    healthCheckService = {
      check: jest.fn(),
    };
    typeOrmHealthIndicator = {
      pingCheck: jest.fn(),
    };

    // Настраиваем возвращаемые значения
    healthCheckService.check.mockResolvedValue({ status: 'ok' });
    typeOrmHealthIndicator.pingCheck.mockResolvedValue({ database: { status: 'up' } });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return health status', async () => {
      const result = await controller.check();
      expect(result).toEqual({ status: 'ok' });
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });
}); 