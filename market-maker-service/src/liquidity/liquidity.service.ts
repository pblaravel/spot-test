import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Interval } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

/**
 * Конфигурация виртуального market-maker'а.
 * account — общий условный кошелёк (1000 USDT, 2 BTC, 2 ETH, 10 BNB).
 * Ликвидность рисуется на трёх парах, а затем «сам с собой» кроссятся ордера,
 * чтобы лента сделок на странице торговли заполнялась данными.
 */

interface MarketConfig {
  /** Символ в order-book-service (без слэша, верхний регистр). */
  symbol: string;
  /** Базовая валюта (BTC/ETH/BNB). */
  base: string;
  /** Котируемая валюта (USDT). */
  quote: string;
  /** Шаг цены (tick) в USDT между уровнями. */
  tickUsd: number;
  /** Средний объём лимитного ордера в базовой валюте. */
  baseQty: number;
  /** URL для получения референсной цены (OKX spot). */
  refUrl: string;
  /** Запасная цена, если референс недоступен. */
  fallbackPrice: number;
}

const MARKETS: MarketConfig[] = [
  {
    symbol: 'BTCUSDT',
    base: 'BTC',
    quote: 'USDT',
    tickUsd: 25,
    baseQty: 0.0025,
    refUrl: 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT',
    fallbackPrice: 77_000,
  },
  {
    symbol: 'ETHUSDT',
    base: 'ETH',
    quote: 'USDT',
    tickUsd: 1.5,
    baseQty: 0.04,
    refUrl: 'https://www.okx.com/api/v5/market/ticker?instId=ETH-USDT',
    fallbackPrice: 3_200,
  },
  {
    symbol: 'BNBUSDT',
    base: 'BNB',
    quote: 'USDT',
    tickUsd: 0.5,
    baseQty: 0.15,
    refUrl: 'https://www.okx.com/api/v5/market/ticker?instId=BNB-USDT',
    fallbackPrice: 610,
  },
];

const LEVELS = 12;

const INITIAL_BALANCES: Record<string, number> = {
  USDT: 1000,
  BTC: 2,
  ETH: 2,
  BNB: 10,
};

@Injectable()
export class LiquidityService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LiquidityService.name);
  private readonly account = 'market-maker';
  /**
   * Виртуальные балансы аккаунта market-maker. Используются как *бюджет*
   * для размещения сетки ордеров: общий USDT делится между парами,
   * базовая валюта расходуется на ask-сторону. Балансы не уменьшаются при
   * seeding (это был бы ложный расход), но уменьшаются при self-trade,
   * где маркет-ордер реально выбивает ликвидность из стакана.
   */
  private readonly balances: Record<string, number> = { ...INITIAL_BALANCES };
  private readonly initialBalances = { ...INITIAL_BALANCES };
  private readonly refPrices = new Map<string, number>();

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log(
      `Market maker account "${this.account}" initialised with ` +
        Object.entries(this.initialBalances)
          .map(([k, v]) => `${v} ${k}`)
          .join(', '),
    );
    await this.refreshAllMarkets();
  }

  @Interval(60_000)
  async refreshAllMarketsInterval(): Promise<void> {
    await this.refreshAllMarkets();
  }

  @Interval(8_000)
  async selfTradeInterval(): Promise<void> {
    for (const market of MARKETS) {
      try {
        await this.selfTrade(market);
      } catch (e) {
        this.logger.warn(
          `Self-trade failed for ${market.symbol}: ${(e as Error).message}`,
        );
      }
    }
  }

  /** Возвращает состояние виртуального аккаунта (для health/debug). */
  getAccountState() {
    return {
      account: this.account,
      initial: this.initialBalances,
      balances: this.balances,
      refPrices: Object.fromEntries(this.refPrices),
    };
  }

  private async refreshAllMarkets(): Promise<void> {
    for (const market of MARKETS) {
      try {
        await this.seedLiquidity(market);
      } catch (e) {
        this.logger.error(
          `Liquidity seed failed for ${market.symbol}: ${(e as Error).message}`,
        );
      }
    }
  }

  private async fetchReferencePrice(market: MarketConfig): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ data?: Array<{ last?: string }> }>(market.refUrl, {
          timeout: 8000,
        }),
      );
      const last = data?.data?.[0]?.last;
      const n = Number.parseFloat(last ?? '');
      if (Number.isFinite(n) && n > 0) {
        this.refPrices.set(market.symbol, n);
        return n;
      }
    } catch (e) {
      this.logger.warn(
        `Reference price fetch failed for ${market.symbol}: ${(e as Error).message}`,
      );
    }
    const fallback = this.refPrices.get(market.symbol) ?? market.fallbackPrice;
    this.refPrices.set(market.symbol, fallback);
    return fallback;
  }

  private async postOrder(body: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market';
    quantity: string;
    price?: string;
  }): Promise<unknown> {
    const base = this.config
      .get<string>('ORDER_BOOK_SERVICE_URL')
      ?.replace(/\/$/, '');
    if (!base) {
      this.logger.error('ORDER_BOOK_SERVICE_URL is not set');
      return null;
    }
    const { data } = await firstValueFrom(
      this.http.post(`${base}/api/v1/orders`, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      }),
    );
    return data;
  }

  /** Возвращает число, округлённое до n знаков после запятой. */
  private round(value: number, digits: number): string {
    const factor = Math.pow(10, digits);
    return (Math.round(value * factor) / factor).toFixed(digits);
  }

  private reserve(currency: string, amount: number): boolean {
    if ((this.balances[currency] ?? 0) < amount) {
      return false;
    }
    this.balances[currency] -= amount;
    return true;
  }

  private credit(currency: string, amount: number): void {
    this.balances[currency] = (this.balances[currency] ?? 0) + amount;
  }

  /**
   * Заливаем симметричную сетку заявок вокруг референсной цены.
   * На bid-стороне объёмы рассчитываются из доли доступного USDT-бюджета этого рынка,
   * на ask-стороне — из доли доступного баланса базовой валюты. Это позволяет
   * равномерно распределить скромный стартовый капитал (1000 USDT / 2 BTC / 2 ETH / 10 BNB)
   * по всем трём парам.
   */
  async seedLiquidity(market: MarketConfig): Promise<void> {
    const ref = await this.fetchReferencePrice(market);

    const activeMarkets = MARKETS.length;
    const quoteBudget = (this.balances[market.quote] ?? 0) / activeMarkets;
    const baseBudget = this.balances[market.base] ?? 0;

    const bidQtyBase = quoteBudget > 0 ? quoteBudget / (ref * LEVELS) : 0;
    const askQtyBase = baseBudget > 0 ? baseBudget / (LEVELS * 1.2) : 0;

    this.logger.log(
      `Seeding ${market.symbol} around ${ref.toFixed(2)} USDT ` +
        `(maker free: ${this.balances[market.base]?.toFixed(4)} ${market.base}, ` +
        `${this.balances[market.quote]?.toFixed(2)} ${market.quote}; ` +
        `bidQty≈${bidQtyBase.toFixed(6)}, askQty≈${askQtyBase.toFixed(6)})`,
    );

    const priceDigits = market.tickUsd < 1 ? 4 : 2;
    const qtyDigits = 6;

    for (let i = 1; i <= LEVELS; i++) {
      const bidPx = ref - i * market.tickUsd;
      const askPx = ref + i * market.tickUsd;
      const qB = bidQtyBase * (1 + i * 0.02);
      const qA = askQtyBase * (1 + i * 0.02);

      if (qB > 0) {
        try {
          await this.postOrder({
            symbol: market.symbol,
            side: 'buy',
            type: 'limit',
            quantity: this.round(qB, qtyDigits),
            price: this.round(bidPx, priceDigits),
          });
        } catch (e) {
          this.logger.warn(
            `Bid seed failed for ${market.symbol}@${bidPx}: ${(e as Error).message}`,
          );
        }
      }

      if (qA > 0) {
        try {
          await this.postOrder({
            symbol: market.symbol,
            side: 'sell',
            type: 'limit',
            quantity: this.round(qA, qtyDigits),
            price: this.round(askPx, priceDigits),
          });
        } catch (e) {
          this.logger.warn(
            `Ask seed failed for ${market.symbol}@${askPx}: ${(e as Error).message}`,
          );
        }
      }
    }
  }

  /**
   * Имитация торговли: периодически отправляем маркет-ордер небольшим объёмом,
   * который «съедает» ближайший уровень противоположной стороны.
   * Деньги/монеты для этого резервируются с виртуального аккаунта маркет-мейкера.
   */
  private async selfTrade(market: MarketConfig): Promise<void> {
    const ref = this.refPrices.get(market.symbol);
    if (!ref) return;

    const side: 'buy' | 'sell' = Math.random() < 0.5 ? 'buy' : 'sell';
    const baseQty = market.baseQty * (0.4 + Math.random() * 0.6);
    const quoteCost = baseQty * ref;
    const priceDigits = market.tickUsd < 1 ? 4 : 2;
    const qtyDigits = 6;

    if (side === 'buy') {
      if (!this.reserve(market.quote, quoteCost * 1.02)) return;
      try {
        await this.postOrder({
          symbol: market.symbol,
          side: 'buy',
          type: 'market',
          quantity: this.round(baseQty, qtyDigits),
        });
        this.credit(market.base, baseQty);
      } catch (e) {
        this.credit(market.quote, quoteCost * 1.02);
        throw e;
      }
    } else {
      if (!this.reserve(market.base, baseQty)) return;
      try {
        await this.postOrder({
          symbol: market.symbol,
          side: 'sell',
          type: 'market',
          quantity: this.round(baseQty, qtyDigits),
        });
        this.credit(market.quote, quoteCost);
      } catch (e) {
        this.credit(market.base, baseQty);
        throw e;
      }
    }

    this.logger.debug(
      `Self-trade ${market.symbol} ${side} ${baseQty.toFixed(6)} @ ~${ref.toFixed(priceDigits)}`,
    );
  }
}
