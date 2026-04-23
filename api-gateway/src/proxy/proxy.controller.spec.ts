import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { HttpStatus } from '@nestjs/common';

describe('ProxyController', () => {
  let controller: ProxyController;
  let proxyService: ProxyService;

  const mockProxyService = {
    proxyToUserService: jest.fn(),
    proxyToTradingEngine: jest.fn(),
    proxyToWalletService: jest.fn(),
    proxyToNotificationService: jest.fn(),
    proxyToAnalyticsService: jest.fn(),
    proxyToMarketMakerService: jest.fn(),
  };

  const mockRequest = {
    url: '/api/users/profile',
    method: 'GET',
    body: {},
    headers: {
      authorization: 'Bearer test-token',
      'content-type': 'application/json',
    },
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    req: { url: '/api/users/profile' },
  } as any as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
      ],
    }).compile();

    controller = module.get<ProxyController>(ProxyController);
    proxyService = module.get<ProxyService>(ProxyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('proxyToUserService', () => {
    it('should successfully proxy request to user service', async () => {
      const mockResult = { id: 1, name: 'Test User' };
      mockProxyService.proxyToUserService.mockResolvedValue(mockResult);

      await controller.proxyToUserService(mockRequest as any, mockResponse as any);

      expect(proxyService.proxyToUserService).toHaveBeenCalledWith(
        'get',
        '/profile',
        undefined,
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors from user service', async () => {
      const mockError = {
        statusCode: 404,
        message: 'User not found',
      };
      mockProxyService.proxyToUserService.mockRejectedValue(mockError);

      await controller.proxyToUserService(mockRequest as any, mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'User not found',
        timestamp: expect.any(String),
        path: '/api/users/profile',
      });
    });
  });

  describe('proxyToTradingEngine', () => {
    it('should successfully proxy request to trading engine', async () => {
      const mockResult = { orderId: '123', status: 'filled' };
      mockProxyService.proxyToTradingEngine.mockResolvedValue(mockResult);

      const tradingRequest = {
        ...mockRequest,
        url: '/api/trading/orders',
        method: 'POST',
        body: { symbol: 'BTC/USD', amount: 1 },
      } as Request;

      await controller.proxyToTradingEngine(tradingRequest as any, mockResponse as any);

      expect(proxyService.proxyToTradingEngine).toHaveBeenCalledWith(
        'post',
        '/orders',
        { symbol: 'BTC/USD', amount: 1 },
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('proxyToWalletService', () => {
    it('should successfully proxy request to wallet service', async () => {
      const mockResult = { balance: 1000, currency: 'USD' };
      mockProxyService.proxyToWalletService.mockResolvedValue(mockResult);

      const walletRequest = {
        ...mockRequest,
        url: '/api/wallet/balance',
        method: 'GET',
      } as Request;

      await controller.proxyToWalletService(walletRequest as any, mockResponse as any);

      expect(proxyService.proxyToWalletService).toHaveBeenCalledWith(
        'get',
        '/balance',
        undefined,
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('proxyToNotificationService', () => {
    it('should successfully proxy request to notification service', async () => {
      const mockResult = { notificationId: '123', status: 'sent' };
      mockProxyService.proxyToNotificationService.mockResolvedValue(mockResult);

      const notificationRequest = {
        ...mockRequest,
        url: '/api/notifications/send',
        method: 'POST',
        body: { message: 'Test notification' },
      } as Request;

      await controller.proxyToNotificationService(notificationRequest as any, mockResponse as any);

      expect(proxyService.proxyToNotificationService).toHaveBeenCalledWith(
        'post',
        '/send',
        { message: 'Test notification' },
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
    });
  });

  describe('proxyToAnalyticsService', () => {
    it('should successfully proxy request to analytics service', async () => {
      const mockResult = { metrics: { volume: 1000000 } };
      mockProxyService.proxyToAnalyticsService.mockResolvedValue(mockResult);

      const analyticsRequest = {
        ...mockRequest,
        url: '/api/analytics/metrics',
        method: 'GET',
      } as Request;

      await controller.proxyToAnalyticsService(analyticsRequest as any, mockResponse as any);

      expect(proxyService.proxyToAnalyticsService).toHaveBeenCalledWith(
        'get',
        '/metrics',
        undefined,
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
    });
  });

  describe('proxyToMarketMakerService', () => {
    it('should successfully proxy request to market maker service', async () => {
      const mockResult = { spread: 0.001, liquidity: 'high' };
      mockProxyService.proxyToMarketMakerService.mockResolvedValue(mockResult);

      const marketMakerRequest = {
        ...mockRequest,
        url: '/api/market-maker/spread',
        method: 'GET',
      } as Request;

      await controller.proxyToMarketMakerService(marketMakerRequest, mockResponse);

      expect(proxyService.proxyToMarketMakerService).toHaveBeenCalledWith(
        'get',
        '/spread',
        undefined,
        {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        }
      );
    });
  });

  describe('extractHeaders', () => {
    it('should extract important headers from request', () => {
      const requestWithHeaders = {
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
          'x-api-key': 'test-api-key',
          'x-request-id': 'test-request-id',
          'user-agent': 'test-agent', // This should be ignored
        },
      } as any;

      // Access private method through controller instance
      const result = (controller as any).extractHeaders(requestWithHeaders);

      expect(result).toEqual({
        authorization: 'Bearer test-token',
        'content-type': 'application/json',
        'x-api-key': 'test-api-key',
        'x-request-id': 'test-request-id',
      });
    });

    it('should return empty object when no important headers present', () => {
      const requestWithoutHeaders = {
        headers: {
          'user-agent': 'test-agent',
          'accept': 'application/json',
        },
      } as any;

      const result = (controller as any).extractHeaders(requestWithoutHeaders);

      expect(result).toEqual({});
    });
  });

  describe('handleError', () => {
    it('should handle error with status code and message', () => {
      const error = {
        statusCode: 500,
        message: 'Internal Server Error',
      };

      (controller as any).handleError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal Server Error',
        timestamp: expect.any(String),
        path: '/api/users/profile',
      });
    });

    it('should use default values when error properties are missing', () => {
      const error = {};

      (controller as any).handleError(error, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal Server Error',
        timestamp: expect.any(String),
        path: '/api/users/profile',
      });
    });
  });
}); 