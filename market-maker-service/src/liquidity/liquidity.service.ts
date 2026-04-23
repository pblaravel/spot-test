import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Interval } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

/** Символ в order-book-service — верхний регистр без слэша (например BTCUSDT) */
const DEFAULT_SYMBOL = 'BTCUSDT';
const LEVELS = 18;
const TICK_USD = 25;

@Injectable()
export class LiquidityService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LiquidityService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedLiquidity();
  }

  @Interval(90_000)
  async refreshLiquidity(): Promise<void> {
    await this.seedLiquidity();
  }

  private async fetchReferencePrice(): Promise<number> {
    const url =
      this.config.get<string>('REFERENCE_PRICE_URL') ||
      'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT';
    try {
      const { data } = await firstValueFrom(this.http.get<{ data?: Array<{ last?: string }> }>(url, { timeout: 8000 }));
      const last = data?.data?.[0]?.last;
      const n = Number.parseFloat(last ?? '');
      if (Number.isFinite(n) && n > 0) return n;
    } catch (e) {
      this.logger.warn(`Reference price fetch failed: ${(e as Error).message}`);
    }
    return 77_000;
  }

  private async postOrder(body: {
    symbol: string;
    side: string;
    type: string;
    quantity: string;
    price: string;
  }): Promise<void> {
    const base = this.config.get<string>('ORDER_BOOK_SERVICE_URL')?.replace(/\/$/, '');
    if (!base) {
      this.logger.error('ORDER_BOOK_SERVICE_URL is not set');
      return;
    }
    await firstValueFrom(
      this.http.post(`${base}/api/v1/orders`, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      }),
    );
  }

  async seedLiquidity(): Promise<void> {
    const symbol = (this.config.get<string>('LIQUIDITY_SYMBOL') || DEFAULT_SYMBOL).toUpperCase();
    const ref = await this.fetchReferencePrice();
    const baseQtyBid = 0.0042;
    const baseQtyAsk = 0.0038;

    this.logger.log(`Seeding ${symbol} around ${ref} USDT…`);

    try {
      for (let i = 1; i <= LEVELS; i++) {
        const bidPx = (ref - i * TICK_USD).toFixed(2);
        const askPx = (ref + i * TICK_USD).toFixed(2);
        const qB = (baseQtyBid + i * 0.00012).toFixed(8);
        const qA = (baseQtyAsk + i * 0.00009).toFixed(8);

        await this.postOrder({
          symbol,
          side: 'buy',
          type: 'limit',
          quantity: qB,
          price: bidPx,
        });
        await this.postOrder({
          symbol,
          side: 'sell',
          type: 'limit',
          quantity: qA,
          price: askPx,
        });
      }
      this.logger.log(`Liquidity seed complete for ${symbol}`);
    } catch (e) {
      this.logger.error(`Liquidity seed failed: ${(e as Error).message}`);
    }
  }
}
