import {
  Controller,
  All,
  Get,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ProxyService } from './proxy.service';
import { ApiTags, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';

// убрать из апи доксов
@Controller('api')
@ApiTags('Proxy')
@ApiExcludeController()
@ApiBearerAuth()
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('wallet/me/usdt')
  async getMyUsdtWallet(@Req() req: Request, @Res() res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Missing bearer token' });
      }
      const token = authHeader.slice(7);
      const payload = this.jwtService.verify<{ sub: string }>(token);
      const path = `/api/v1/wallets/user/${payload.sub}/currency/USDT`;
      const result = await this.proxyService.proxyToWalletService('get', path, undefined, {});
      return res.status(HttpStatus.OK).json(result);
    } catch (error: any) {
      if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
      }
      this.handleError(error, res);
    }
  }

  @All('users/*')
  async proxyToUserService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/users', '/api/v1/users');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToUserService(method, path, data, headers);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  @All('trading/*')
  async proxyToTradingEngine(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/trading', '');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToTradingEngine(method, path, data, headers);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  @All('wallet/*')
  async proxyToWalletService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/wallet', '');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToWalletService(method, path, data, headers);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  @All('notifications/*')
  async proxyToNotificationService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/notifications', '');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToNotificationService(method, path, data, headers);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  @All('analytics/*')
  async proxyToAnalyticsService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/analytics', '');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToAnalyticsService(method, path, data, headers);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  @All('market-maker/*')
  async proxyToMarketMakerService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/market-maker', '');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToMarketMakerService(method, path, data, headers);
      
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /** Прямой доступ к order-book-service (стакан и сделки по паре) */
  @All('exchange/order-book/*')
  async proxyToOrderBookService(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.url.replace('/api/exchange/order-book', '/api/v1');
      const method = req.method.toLowerCase();
      const data = method === 'get' ? undefined : req.body;
      const headers = this.extractHeaders(req);

      const result = await this.proxyService.proxyToOrderBookService(method, path, data, headers);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private extractHeaders(req: Request): any {
    const headers: any = {};
    
    // Копируем важные заголовки
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'];
    }
    if (req.headers['x-api-key']) {
      headers['x-api-key'] = req.headers['x-api-key'];
    }
    if (req.headers['x-request-id']) {
      headers['x-request-id'] = req.headers['x-request-id'];
    }

    return headers;
  }

  private handleError(error: any, res: Response) {
    const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: res.req.url,
    });
  }
} 