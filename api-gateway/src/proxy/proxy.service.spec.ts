import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';

describe('ProxyService', () => {
  let service: ProxyService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        USER_SERVICE_URL: 'http://user-service:3001',
        TRADING_ENGINE_URL: 'http://trading-engine:3002',
        WALLET_SERVICE_URL: 'http://wallet-service:3003',
        NOTIFICATION_SERVICE_URL: 'http://notification-service:3004',
        ANALYTICS_SERVICE_URL: 'http://analytics-service:3005',
        MARKET_MAKER_SERVICE_URL: 'http://market-maker-service:3006',
        ORDER_BOOK_SERVICE_URL: 'http://order-book-service:8081',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('proxyToUserService', () => {
    it('should successfully proxy request to user service', async () => {
      const mockResponse = { data: { id: 1, name: 'Test User' } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).userServiceClient = mockClient;

      const result = await service.proxyToUserService('get', '/users/1', undefined, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/users/1',
        data: undefined,
        headers: {},
      });
    });

    it('should handle user service errors', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
      };
      const mockClient = { request: jest.fn().mockRejectedValue(mockError) };
      (service as any).userServiceClient = mockClient;

      try {
        await service.proxyToUserService('get', '/users/999', undefined, {});
      } catch (error) {
        expect(error).toEqual({
          statusCode: 404,
          message: 'User Service: User not found',
          error: 'Internal Server Error',
        });
      }
    });
  });

  describe('proxyToTradingEngine', () => {
    it('should successfully proxy request to trading engine', async () => {
      const mockResponse = { data: { orderId: '123', status: 'filled' } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).tradingEngineClient = mockClient;

      const result = await service.proxyToTradingEngine('post', '/orders', { symbol: 'BTC/USD' }, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'post',
        url: '/orders',
        data: { symbol: 'BTC/USD' },
        headers: {},
      });
    });

    it('should handle trading engine timeout errors', async () => {
      const mockError = {
        request: {},
        message: 'timeout of 3000ms exceeded',
      };
      const mockClient = { request: jest.fn().mockRejectedValue(mockError) };
      (service as any).tradingEngineClient = mockClient;

      try {
        await service.proxyToTradingEngine('post', '/orders', {}, {});
      } catch (error) {
        expect(error).toEqual({
          statusCode: 503,
          message: 'Trading Engine недоступен',
          error: 'Service Unavailable',
        });
      }
    });
  });

  describe('proxyToWalletService', () => {
    it('should successfully proxy request to wallet service', async () => {
      const mockResponse = { data: { balance: 1000, currency: 'USD' } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).walletServiceClient = mockClient;

      const result = await service.proxyToWalletService('get', '/wallets/1', undefined, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/wallets/1',
        data: undefined,
        headers: {},
      });
    });

    it('should handle wallet service network errors', async () => {
      const mockError = {
        message: 'Network Error',
      };
      const mockClient = { request: jest.fn().mockRejectedValue(mockError) };
      (service as any).walletServiceClient = mockClient;

      try {
        await service.proxyToWalletService('get', '/wallets/1', undefined, {});
      } catch (error) {
        expect(error).toEqual({
          statusCode: 500,
          message: 'Ошибка при обращении к Wallet Service',
          error: 'Network Error',
        });
      }
    });
  });

  describe('proxyToNotificationService', () => {
    it('should successfully proxy request to notification service', async () => {
      const mockResponse = { data: { notificationId: '123', status: 'sent' } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).notificationServiceClient = mockClient;

      const result = await service.proxyToNotificationService('post', '/notifications', { message: 'Test' }, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'post',
        url: '/notifications',
        data: { message: 'Test' },
        headers: {},
      });
    });
  });

  describe('proxyToAnalyticsService', () => {
    it('should successfully proxy request to analytics service', async () => {
      const mockResponse = { data: { metrics: { volume: 1000000 } } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).analyticsServiceClient = mockClient;

      const result = await service.proxyToAnalyticsService('get', '/metrics', undefined, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/metrics',
        data: undefined,
        headers: {},
      });
    });
  });

  describe('proxyToMarketMakerService', () => {
    it('should successfully proxy request to market maker service', async () => {
      const mockResponse = { data: { spread: 0.001, liquidity: 'high' } };
      const mockClient = { request: jest.fn().mockResolvedValue(mockResponse) };
      (service as any).marketMakerServiceClient = mockClient;

      const result = await service.proxyToMarketMakerService('get', '/spread', undefined, {});

      expect(result).toEqual(mockResponse.data);
      expect(mockClient.request).toHaveBeenCalledWith({
        method: 'get',
        url: '/spread',
        data: undefined,
        headers: {},
      });
    });
  });
}); 