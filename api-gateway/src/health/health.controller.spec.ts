import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpHealthIndicator: HttpHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const mockHealthResult = {
        status: 'ok' as any,
        info: {
          'nestjs-docs': {
            status: 'up' as any,
          },
        },
        details: {
          'nestjs-docs': {
            status: 'up' as any,
          },
        },
      };

      jest.spyOn(healthCheckService, 'check').mockResolvedValue(mockHealthResult);
      jest.spyOn(httpHealthIndicator, 'pingCheck').mockReturnValue(
        Promise.resolve({ 'nestjs-docs': { status: 'up' } })
      );

      const result = await controller.check();

      expect(result).toEqual(mockHealthResult);
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should handle health check errors', async () => {
      const mockError = new Error('Health check failed');
      jest.spyOn(healthCheckService, 'check').mockRejectedValue(mockError);

      await expect(controller.check()).rejects.toThrow('Health check failed');
    });
  });
}); 