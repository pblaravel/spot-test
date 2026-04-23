import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ProxyService {
  private readonly userServiceClient: AxiosInstance;
  private readonly tradingEngineClient: AxiosInstance;
  private readonly walletServiceClient: AxiosInstance;
  private readonly notificationServiceClient: AxiosInstance;
  private readonly analyticsServiceClient: AxiosInstance;
  private readonly marketMakerServiceClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    // Инициализация HTTP клиентов для каждого микросервиса
    console.log(this.configService.get('USER_SERVICE_URL'));
    this.userServiceClient = axios.create({
      baseURL: this.configService.get('USER_SERVICE_URL'),
      timeout: 5000,
    });

    this.tradingEngineClient = axios.create({
      baseURL: this.configService.get('TRADING_ENGINE_URL'),
      timeout: 3000, // Меньший timeout для критичных операций
    });

    this.walletServiceClient = axios.create({
      baseURL: this.configService.get('WALLET_SERVICE_URL'),
      timeout: 5000,
    });

    this.notificationServiceClient = axios.create({
      baseURL: this.configService.get('NOTIFICATION_SERVICE_URL'),
      timeout: 5000,
    });

    this.analyticsServiceClient = axios.create({
      baseURL: this.configService.get('ANALYTICS_SERVICE_URL'),
      timeout: 10000, // Больший timeout для аналитики
    });

    this.marketMakerServiceClient = axios.create({
      baseURL: this.configService.get('MARKET_MAKER_SERVICE_URL'),
      timeout: 5000,
    });
  }

  // Методы для проксирования запросов к User Service
  async proxyToUserService(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.userServiceClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'User Service');
    }
  }

  // Методы для проксирования запросов к Trading Engine
  async proxyToTradingEngine(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.tradingEngineClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Trading Engine');
    }
  }

  // Методы для проксирования запросов к Wallet Service
  async proxyToWalletService(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.walletServiceClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Wallet Service');
    }
  }

  // Методы для проксирования запросов к Notification Service
  async proxyToNotificationService(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.notificationServiceClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Notification Service');
    }
  }

  // Методы для проксирования запросов к Analytics Service
  async proxyToAnalyticsService(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.analyticsServiceClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Analytics Service');
    }
  }

  // Методы для проксирования запросов к Market Maker Service
  async proxyToMarketMakerService(method: string, path: string, data?: any, headers?: any) {
    try {
      const response = await this.marketMakerServiceClient.request({
        method,
        url: path,
        data,
        headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Market Maker Service');
    }
  }

  private handleError(error: any, serviceName: string) {
    console.error(`Error calling ${serviceName}:`, error.message);
    
    if (error.response) {
      // Сервер ответил с ошибкой
      return {
        statusCode: error.response.status,
        message: `${serviceName}: ${error.response.data?.message || error.message}`,
        error: error.response.data?.error || 'Internal Server Error',
      };
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      return {
        statusCode: 503,
        message: `${serviceName} недоступен`,
        error: 'Service Unavailable',
      };
    } else {
      // Ошибка при настройке запроса
      return {
        statusCode: 500,
        message: `Ошибка при обращении к ${serviceName}`,
        error: error.message,
      };
    }
  }
} 