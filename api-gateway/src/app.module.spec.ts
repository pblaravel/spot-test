import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { HealthController } from './health/health.controller';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyService } from './proxy/proxy.service';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide HealthController', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const controller = module.get<HealthController>(HealthController);
    expect(controller).toBeInstanceOf(HealthController);
  });

  it('should provide ProxyController', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const controller = module.get<ProxyController>(ProxyController);
    expect(controller).toBeInstanceOf(ProxyController);
  });

  it('should provide ProxyService', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const service = module.get<ProxyService>(ProxyService);
    expect(service).toBeInstanceOf(ProxyService);
  });

}); 