import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as ccxt from 'ccxt';

@Injectable()
export class SpotExchangeService {
  private readonly logger = new Logger(SpotExchangeService.name);
  private readonly baseUrl: string;
  private ccxtPublic: ccxt.Exchange | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('GATEWAY_PUBLIC_URL')?.replace(/\/$/, '') ||
      `http://127.0.0.1:${this.configService.get<string>('PORT') || '3000'}`;
  }

  /** Публичные котировки с внешней биржи (реалистичные данные для демо UI). */
  private getPublicMarketExchange(): ccxt.Exchange {
    if (!this.ccxtPublic) {
      const id = (this.configService.get<string>('CCXT_PUBLIC_EXCHANGE_ID') || 'binance').toLowerCase();
      const ExchangeClass = (ccxt as any)[id] as typeof ccxt.Exchange;
      if (!ExchangeClass) {
        this.logger.warn(`Unknown CCXT_PUBLIC_EXCHANGE_ID=${id}, falling back to binance`);
        this.ccxtPublic = new ccxt.binance({ enableRateLimit: true });
      } else {
        this.ccxtPublic = new ExchangeClass({ enableRateLimit: true });
      }
    }
    return this.ccxtPublic;
  }

  /**
   * Получить тикер (CCXT: fetchTicker)
   */
  async fetchTicker(symbol: string): Promise<any> {
    try {
      const ex = this.getPublicMarketExchange();
      const ticker = await ex.fetchTicker(symbol);
      return {
        symbol: ticker.symbol,
        timestamp: ticker.timestamp,
        datetime: ticker.datetime,
        high: ticker.high,
        low: ticker.low,
        bid: ticker.bid,
        ask: ticker.ask,
        last: ticker.last,
        close: ticker.close,
        baseVolume: ticker.baseVolume,
        quoteVolume: ticker.quoteVolume,
        percentage: ticker.percentage,
        change: ticker.change,
        average: ticker.average,
        info: ticker.info,
      };
    } catch (error) {
      this.logger.error(`Error fetching ticker for ${symbol}:`, error.message);
      throw new BadRequestException(`Failed to fetch ticker: ${error.message}`);
    }
  }

  /**
   * Получить OHLCV данные (CCXT: fetchOHLCV)
   */
  async fetchOHLCV(symbol: string, timeframe: string = '1h', since?: number, limit?: number): Promise<any[]> {
    try {
      const ex = this.getPublicMarketExchange();
      return await ex.fetchOHLCV(symbol, timeframe, since, limit);
    } catch (error) {
      this.logger.error(`Error fetching OHLCV for ${symbol}:`, error.message);
      throw new BadRequestException(`Failed to fetch OHLCV: ${error.message}`);
    }
  }

  /**
   * Получить стакан заявок (CCXT: fetchOrderBook)
   */
  async fetchOrderBook(symbol: string, limit?: number): Promise<any> {
    try {
      const ex = this.getPublicMarketExchange();
      const ob = await ex.fetchOrderBook(symbol, limit);
      return {
        symbol: ob.symbol,
        timestamp: ob.timestamp,
        datetime: ob.datetime,
        nonce: ob.nonce,
        bids: ob.bids,
        asks: ob.asks,
        info: (ob as { info?: unknown }).info,
      };
    } catch (error) {
      this.logger.error(`Error fetching order book for ${symbol}:`, error.message);
      throw new BadRequestException(`Failed to fetch order book: ${error.message}`);
    }
  }

  /**
   * Получить последние сделки (CCXT: fetchTrades)
   */
  async fetchTrades(symbol: string, since?: number, limit?: number): Promise<any[]> {
    try {
      const ex = this.getPublicMarketExchange();
      const trades = await ex.fetchTrades(symbol, since, limit);
      return trades.map((trade) => ({
        id: trade.id,
        timestamp: trade.timestamp,
        datetime: trade.datetime,
        symbol: trade.symbol,
        order: trade.order,
        type: trade.type,
        side: trade.side,
        takerOrMaker: trade.takerOrMaker,
        price: trade.price,
        amount: trade.amount,
        cost: trade.cost,
        fee: trade.fee,
        info: trade.info,
      }));
    } catch (error) {
      this.logger.error(`Error fetching trades for ${symbol}:`, error.message);
      throw new BadRequestException(`Failed to fetch trades: ${error.message}`);
    }
  }

  /**
   * Создать ордер (CCXT: createOrder)
   */
  async createOrder(symbol: string, type: 'market' | 'limit', side: 'buy' | 'sell', amount: number, price?: number): Promise<any> {
    try {
      const orderData = {
        symbol,
        type,
        side,
        amount,
        price: type === 'limit' ? price : undefined
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/trading/orders`, orderData)
      );

      // Преобразуем в CCXT формат
      return {
        id: response.data.id,
        clientOrderId: response.data.clientOrderId,
        datetime: new Date(response.data.createdAt).toISOString(),
        timestamp: new Date(response.data.createdAt).getTime(),
        lastTradeTimestamp: response.data.lastTradeTimestamp,
        status: response.data.status,
        symbol: response.data.symbol,
        type: response.data.type,
        timeInForce: response.data.timeInForce,
        side: response.data.side,
        price: response.data.price,
        stopPrice: response.data.stopPrice,
        amount: response.data.amount,
        filled: response.data.filled,
        remaining: response.data.remaining,
        cost: response.data.cost,
        trades: response.data.trades,
        fee: response.data.fee,
        info: response.data
      };
    } catch (error) {
      this.logger.error(`Error creating order for ${symbol}:`, error.message);
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Получить баланс (CCXT: fetchBalance)
   */
  async fetchBalance(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/wallets/balance`)
      );

      // Преобразуем в CCXT формат
      const balance = {};
      for (const [currency, data] of Object.entries(response.data)) {
        const balanceData = data as any;
        balance[currency] = {
          free: balanceData.available,
          used: balanceData.locked,
          total: balanceData.total,
          debt: balanceData.debt || 0,
          borrowed: balanceData.borrowed || 0,
          info: data
        };
      }

      return {
        free: {},
        used: {},
        total: {},
        info: response.data,
        ...balance
      };
    } catch (error) {
      this.logger.error('Error fetching balance:', error.message);
      throw new BadRequestException(`Failed to fetch balance: ${error.message}`);
    }
  }

  /**
   * Получить ордера (CCXT: fetchOrders)
   */
  async fetchOrders(symbol?: string, since?: number, limit?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      if (since) params.append('since', since.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/orders?${params}`)
      );

      // Преобразуем в CCXT формат
      return response.data.map(order => ({
        id: order.id,
        clientOrderId: order.clientOrderId,
        datetime: new Date(order.createdAt).toISOString(),
        timestamp: new Date(order.createdAt).getTime(),
        lastTradeTimestamp: order.lastTradeTimestamp,
        status: order.status,
        symbol: order.symbol,
        type: order.type,
        timeInForce: order.timeInForce,
        side: order.side,
        price: order.price,
        stopPrice: order.stopPrice,
        amount: order.amount,
        filled: order.filled,
        remaining: order.remaining,
        cost: order.cost,
        trades: order.trades,
        fee: order.fee,
        info: order
      }));
    } catch (error) {
      this.logger.error('Error fetching orders:', error.message);
      throw new BadRequestException(`Failed to fetch orders: ${error.message}`);
    }
  }

  /**
   * Получить информацию о рынках (CCXT: loadMarkets)
   */
  async loadMarkets(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/markets`)
      );

      // Преобразуем в CCXT формат
      const markets = {};
      for (const market of response.data) {
        markets[market.symbol] = {
          id: market.id,
          symbol: market.symbol,
          base: market.baseCurrency,
          quote: market.quoteCurrency,
          baseId: market.baseCurrency,
          quoteId: market.quoteCurrency,
          type: market.type,
          spot: market.type === 'spot',
          margin: market.type === 'margin',
          swap: market.type === 'swap',
          future: market.type === 'future',
          option: market.type === 'option',
          active: market.isActive,
          contract: market.isContract || false,
          linear: market.isLinear || false,
          inverse: market.isInverse || false,
          contractSize: market.contractSize || 1,
          expiry: market.expiry,
          expiryDatetime: market.expiryDatetime,
          strike: market.strike,
          optionType: market.optionType,
          settled: market.settled || false,
          precision: {
            amount: market.precision?.amount,
            price: market.precision?.price,
            cost: market.precision?.cost
          },
          limits: {
            amount: {
              min: market.limits?.amount?.min,
              max: market.limits?.amount?.max
            },
            price: {
              min: market.limits?.price?.min,
              max: market.limits?.price?.max
            },
            cost: {
              min: market.limits?.cost?.min,
              max: market.limits?.cost?.max
            }
          },
          info: market
        };
      }

      return markets;
    } catch (error) {
      this.logger.error('Error loading markets:', error.message);
      throw new BadRequestException(`Failed to load markets: ${error.message}`);
    }
  }

  /**
   * Получить информацию о бирже (CCXT: has)
   */
  get has(): any {
    return {
      fetchTicker: true,
      fetchOHLCV: true,
      fetchOrderBook: true,
      fetchTrades: true,
      createOrder: true,
      fetchBalance: true,
      fetchOrders: true,
      loadMarkets: true
    };
  }

  /**
   * Получить ID биржи
   */
  get id(): string {
    return 'spot';
  }

  /**
   * Получить название биржи
   */
  get name(): string {
    return 'Spot Exchange';
  }
} 