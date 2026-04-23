import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpotExchangeService {
  private readonly logger = new Logger(SpotExchangeService.name);
  private readonly baseUrl = 'http://localhost:3000'; // Ваш API Gateway

  constructor(private readonly httpService: HttpService) {}

  // CCXT-совместимые методы для вашей биржи

  /**
   * Получить тикер (CCXT: fetchTicker)
   */
  async fetchTicker(symbol: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/ticker/${symbol}`)
      );
      
      // Преобразуем в CCXT формат
      return {
        symbol: response.data.symbol,
        timestamp: response.data.timestamp,
        datetime: new Date(response.data.timestamp).toISOString(),
        high: response.data.high,
        low: response.data.low,
        bid: response.data.bid,
        ask: response.data.ask,
        last: response.data.last,
        close: response.data.last,
        baseVolume: response.data.volume,
        quoteVolume: response.data.quoteVolume,
        percentage: response.data.percentage,
        change: response.data.change,
        average: response.data.average,
        info: response.data
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
      const params = new URLSearchParams();
      if (timeframe) params.append('timeframe', timeframe);
      if (since) params.append('since', since.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/ohlcv/${symbol}?${params}`)
      );

      // Преобразуем в CCXT формат [timestamp, open, high, low, close, volume]
      return response.data.map(candle => [
        candle.timestamp,
        candle.open,
        candle.high,
        candle.low,
        candle.close,
        candle.volume
      ]);
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
      const params = limit ? `?limit=${limit}` : '';
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/orderbook/${symbol}${params}`)
      );

      // Преобразуем в CCXT формат
      return {
        symbol: response.data.symbol,
        timestamp: response.data.timestamp,
        datetime: new Date(response.data.timestamp).toISOString(),
        nonce: response.data.nonce,
        bids: response.data.bids,
        asks: response.data.asks,
        info: response.data
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
      const params = new URLSearchParams();
      if (since) params.append('since', since.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/trading/trades/${symbol}?${params}`)
      );

      // Преобразуем в CCXT формат
      return response.data.map(trade => ({
        id: trade.id,
        timestamp: trade.timestamp,
        datetime: new Date(trade.timestamp).toISOString(),
        symbol: trade.symbol,
        order: trade.orderId,
        type: trade.type,
        side: trade.side,
        takerOrMaker: trade.takerOrMaker,
        price: trade.price,
        amount: trade.amount,
        cost: trade.cost,
        fee: trade.fee,
        info: trade
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