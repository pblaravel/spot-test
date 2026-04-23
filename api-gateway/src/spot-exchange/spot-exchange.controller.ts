import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Body, 
  Query, 
  Param, 
  HttpCode, 
  HttpStatus,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SpotExchangeService } from './spot-exchange.service';

@ApiTags('Spot Exchange CCXT API')
@Controller('spot')
@UsePipes(new ValidationPipe({ transform: true }))
export class SpotExchangeController {
  constructor(private readonly spotExchangeService: SpotExchangeService) {}

  @Get('ticker/:symbol')
  @ApiOperation({ summary: 'Fetch ticker for a symbol (CCXT: fetchTicker)' })
  @ApiParam({ name: 'symbol', description: 'Symbol (e.g., BTC/USDT)' })
  @ApiResponse({ status: 200, description: 'Ticker data in CCXT format' })
  async fetchTicker(@Param('symbol') symbol: string) {
    return this.spotExchangeService.fetchTicker(symbol);
  }

  @Get('ohlcv/:symbol')
  @ApiOperation({ summary: 'Fetch OHLCV data for a symbol (CCXT: fetchOHLCV)' })
  @ApiParam({ name: 'symbol', description: 'Symbol (e.g., BTC/USDT)' })
  @ApiQuery({ name: 'timeframe', description: 'Timeframe (e.g., 1m, 5m, 1h, 1d)', required: false })
  @ApiQuery({ name: 'since', description: 'Since timestamp', required: false })
  @ApiQuery({ name: 'limit', description: 'Limit of candles', required: false })
  @ApiResponse({ status: 200, description: 'OHLCV data in CCXT format' })
  async fetchOHLCV(
    @Param('symbol') symbol: string,
    @Query('timeframe') timeframe: string = '1h',
    @Query('since') since?: number,
    @Query('limit') limit?: number
  ) {
    return this.spotExchangeService.fetchOHLCV(symbol, timeframe, since, limit);
  }

  @Get('orderbook/:symbol')
  @ApiOperation({ summary: 'Fetch order book for a symbol (CCXT: fetchOrderBook)' })
  @ApiParam({ name: 'symbol', description: 'Symbol (e.g., BTC/USDT)' })
  @ApiQuery({ name: 'limit', description: 'Limit of orders', required: false })
  @ApiResponse({ status: 200, description: 'Order book data in CCXT format' })
  async fetchOrderBook(
    @Param('symbol') symbol: string,
    @Query('limit') limit?: number
  ) {
    return this.spotExchangeService.fetchOrderBook(symbol, limit);
  }

  @Get('trades/:symbol')
  @ApiOperation({ summary: 'Fetch recent trades for a symbol (CCXT: fetchTrades)' })
  @ApiParam({ name: 'symbol', description: 'Symbol (e.g., BTC/USDT)' })
  @ApiQuery({ name: 'since', description: 'Since timestamp', required: false })
  @ApiQuery({ name: 'limit', description: 'Limit of trades', required: false })
  @ApiResponse({ status: 200, description: 'Recent trades in CCXT format' })
  async fetchTrades(
    @Param('symbol') symbol: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number
  ) {
    return this.spotExchangeService.fetchTrades(symbol, since, limit);
  }

  @Post('order')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order (CCXT: createOrder)' })
  @ApiResponse({ status: 201, description: 'Order created successfully in CCXT format' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrder(@Body() orderData: {
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
  }) {
    return this.spotExchangeService.createOrder(
      orderData.symbol,
      orderData.type,
      orderData.side,
      orderData.amount,
      orderData.price
    );
  }

  @Get('balance')
  @ApiOperation({ summary: 'Fetch account balance (CCXT: fetchBalance)' })
  @ApiResponse({ status: 200, description: 'Account balance in CCXT format' })
  async fetchBalance() {
    return this.spotExchangeService.fetchBalance();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Fetch orders (CCXT: fetchOrders)' })
  @ApiQuery({ name: 'symbol', description: 'Symbol (e.g., BTC/USDT)', required: false })
  @ApiQuery({ name: 'since', description: 'Since timestamp', required: false })
  @ApiQuery({ name: 'limit', description: 'Limit of orders', required: false })
  @ApiResponse({ status: 200, description: 'Orders list in CCXT format' })
  async fetchOrders(
    @Query('symbol') symbol?: string,
    @Query('since') since?: number,
    @Query('limit') limit?: number
  ) {
    return this.spotExchangeService.fetchOrders(symbol, since, limit);
  }

  @Get('markets')
  @ApiOperation({ summary: 'Load markets (CCXT: loadMarkets)' })
  @ApiResponse({ status: 200, description: 'Markets information in CCXT format' })
  async loadMarkets() {
    return this.spotExchangeService.loadMarkets();
  }

  @Get('info')
  @ApiOperation({ summary: 'Get exchange information (CCXT: has, id, name)' })
  @ApiResponse({ status: 200, description: 'Exchange information' })
  async getExchangeInfo() {
    return {
      id: this.spotExchangeService.id,
      name: this.spotExchangeService.name,
      has: this.spotExchangeService.has,
      urls: {
        api: {
          public: 'http://localhost:3000/spot',
          private: 'http://localhost:3000/spot'
        },
        www: 'http://localhost:3008',
        doc: 'http://localhost:3000/docs'
      },
      api: {
        public: {
          get: [
            'ticker/{symbol}',
            'ohlcv/{symbol}',
            'orderbook/{symbol}',
            'trades/{symbol}',
            'markets',
            'balance',
            'orders'
          ]
        },
        private: {
          post: [
            'order'
          ]
        }
      },
      timeframes: {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
        '1w': '1w'
      }
    };
  }

  // Дополнительные эндпоинты для полной CCXT совместимости


} 