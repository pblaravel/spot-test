"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  apiClient,
  ExchangeOrderBookEntry,
  ExchangeOrderBookSnapshot,
  ExchangeTrade,
  Wallet,
} from "@/lib/api-client"

interface MarketPair {
  /** Символ в order-book-service (без слэша, верхний регистр). */
  symbol: string
  /** Человекочитаемое отображение пары. */
  display: string
  /** Базовая валюта (BTC/ETH/BNB). */
  base: string
  /** Котируемая валюта (USDT). */
  quote: string
  /** Количество знаков после запятой для цены в UI. */
  priceDigits: number
  /** Количество знаков после запятой для объёма в базовой валюте. */
  qtyDigits: number
}

const MARKETS: MarketPair[] = [
  { symbol: "BTCUSDT", display: "BTC/USDT", base: "BTC", quote: "USDT", priceDigits: 2, qtyDigits: 6 },
  { symbol: "ETHUSDT", display: "ETH/USDT", base: "ETH", quote: "USDT", priceDigits: 2, qtyDigits: 6 },
  { symbol: "BNBUSDT", display: "BNB/USDT", base: "BNB", quote: "USDT", priceDigits: 4, qtyDigits: 4 },
]

const DEFAULT_MARKET = MARKETS[0]

const FEE_RATE = 0.001

const ACCENT = "#4A80F0"
const BUY = "#22AD8F"
const SELL = "#F04A4A"

function parseDec(s: string): number {
  const n = Number.parseFloat(String(s).replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(n) ? n : NaN
}

function fmtNum(n: number, maxFrac = 8): string {
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFrac,
  }).format(n)
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n)
}

export default function TradingPage() {
  const [market, setMarket] = useState<MarketPair>(DEFAULT_MARKET)
  const [snapshots, setSnapshots] = useState<Record<string, ExchangeOrderBookSnapshot>>({})
  const [snapshot, setSnapshot] = useState<ExchangeOrderBookSnapshot | null>(null)
  const [trades, setTrades] = useState<ExchangeTrade[]>([])
  const [usdtWallet, setUsdtWallet] = useState<Wallet | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderMode, setOrderMode] = useState<"limit" | "market">("limit")
  const [buyPrice, setBuyPrice] = useState("")
  const [buyAmount, setBuyAmount] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [submitting, setSubmitting] = useState<"buy" | "sell" | null>(null)

  const loadBook = useCallback(async (sym: string) => {
    const res = await apiClient.getExchangeOrderBook(sym)
    if (res.error || !res.data) {
      if (sym === market.symbol) {
        setLoadErr(res.error || "Стакан недоступен")
        setSnapshot(null)
      }
    } else {
      if (sym === market.symbol) {
        setLoadErr(null)
        setSnapshot(res.data)
      }
      setSnapshots((prev) => ({ ...prev, [sym]: res.data! }))
    }
    if (sym === market.symbol) setLoading(false)
  }, [market.symbol])

  const loadTrades = useCallback(async (sym: string) => {
    const res = await apiClient.getExchangeTrades(sym)
    if (sym === market.symbol && res.data?.trades) setTrades(res.data.trades)
  }, [market.symbol])

  const loadWallet = useCallback(async () => {
    const w = await apiClient.getMyUsdtWallet()
    if (w.data) setUsdtWallet(w.data)
    else setUsdtWallet(null)
  }, [])

  useEffect(() => {
    setLoading(true)
    setTrades([])
    setBuyPrice("")
    setSellPrice("")
  }, [market.symbol])

  useEffect(() => {
    void loadBook(market.symbol)
    void loadTrades(market.symbol)
    void loadWallet()

    // Подтягиваем стаканы по всем парам, чтобы корректно показывать Δ24ч/last в списке рынков.
    MARKETS.forEach((m) => {
      if (m.symbol !== market.symbol) void loadBook(m.symbol)
    })

    const t = setInterval(() => {
      void loadBook(market.symbol)
      void loadTrades(market.symbol)
      MARKETS.forEach((m) => {
        if (m.symbol !== market.symbol) void loadBook(m.symbol)
      })
    }, 2500)
    return () => clearInterval(t)
  }, [loadBook, loadTrades, loadWallet, market.symbol])

  const bestBid = snapshot?.bids?.[0]
  const bestAsk = snapshot?.asks?.[0]
  const mid =
    bestBid && bestAsk
      ? (parseDec(bestBid.price) + parseDec(bestAsk.price)) / 2
      : bestBid
        ? parseDec(bestBid.price)
        : bestAsk
          ? parseDec(bestAsk.price)
          : NaN

  useEffect(() => {
    if (!Number.isFinite(mid)) return
    setBuyPrice((p) => (p.trim() ? p : String(mid)))
    setSellPrice((p) => (p.trim() ? p : String(mid)))
  }, [mid])

  const asksDisplay = useMemo(() => {
    const rows = snapshot?.asks ?? []
    return [...rows].sort((a, b) => parseDec(a.price) - parseDec(b.price)).slice(0, 14)
  }, [snapshot])

  const bidsDisplay = useMemo(() => {
    const rows = snapshot?.bids ?? []
    return [...rows].sort((a, b) => parseDec(b.price) - parseDec(a.price)).slice(0, 14)
  }, [snapshot])

  const volBase = useMemo(() => {
    let s = 0
    for (const r of asksDisplay) s += parseDec(r.quantity)
    for (const r of bidsDisplay) s += parseDec(r.quantity)
    return s
  }, [asksDisplay, bidsDisplay])

  const volQuote = useMemo(() => {
    let s = 0
    for (const r of asksDisplay) s += parseDec(r.quantity) * parseDec(r.price)
    for (const r of bidsDisplay) s += parseDec(r.quantity) * parseDec(r.price)
    return s
  }, [asksDisplay, bidsDisplay])

  const spreadPct =
    bestBid && bestAsk && parseDec(bestBid.price) > 0
      ? ((parseDec(bestAsk.price) - parseDec(bestBid.price)) / parseDec(bestBid.price)) * 100
      : 0

  const place = async (side: "buy" | "sell") => {
    const priceStr = side === "buy" ? buyPrice : sellPrice
    const amtStr = side === "buy" ? buyAmount : sellAmount
    const qty = parseDec(amtStr)
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Укажите объём BTC")
      return
    }
    if (orderMode === "limit") {
      const px = parseDec(priceStr)
      if (!Number.isFinite(px) || px <= 0) {
        toast.error("Укажите цену")
        return
      }
    }
    if (!usdtWallet) {
      toast.error("Войдите в аккаунт для размещения заявки")
      return
    }

    setSubmitting(side)
    try {
      const px = parseDec(priceStr)
      const res = await apiClient.createExchangeOrder({
        symbol: market.symbol,
        side,
        type: orderMode,
        quantity: amtStr.trim().replace(",", "."),
        price: orderMode === "limit" ? String(px) : undefined,
      })
      if (res.error || !res.data) {
        toast.error(res.error || "Ошибка")
        return
      }
      toast.success(side === "buy" ? "Заявка на покупку отправлена" : "Заявка на продажу отправлена", {
        description: `ID: ${res.data.order_id}`,
      })
      void loadBook(market.symbol)
      void loadTrades(market.symbol)
    } finally {
      setSubmitting(null)
    }
  }

  const pctClass = spreadPct >= 0 ? "text-emerald-600" : "text-rose-600"

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900">
      {/* Верхняя панель пары */}
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="w-full px-4 py-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500 font-medium">{market.display}</div>
            <div className="text-3xl font-semibold tabular-nums" style={{ color: BUY }}>
              {Number.isFinite(mid) ? fmtMoney(mid) : "—"}{" "}
              <span className="text-lg font-normal text-slate-500">{market.quote}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Спред" value={`${fmtNum(spreadPct, 3)}%`} valueClass={pctClass} />
            <Stat label={`Объём стакана (${market.base})`} value={fmtNum(volBase, 8)} />
            <Stat label={`Оборот стакана (${market.quote})`} value={fmtMoney(volQuote)} />
            {usdtWallet && (
              <Stat label="Баланс USDT" value={fmtMoney(Number(usdtWallet.balance))} valueClass="text-slate-800" />
            )}
          </div>
        </div>
      </header>

      <div className="w-full px-4 py-4 space-y-4">
        {loadErr && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
            {loadErr}. Убедитесь, что запущены order-book-service и api-gateway (маршрут{" "}
            <code className="text-xs">/api/exchange/order-book/*</code>).
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Список пар */}
          <aside className="xl:col-span-2">
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b">
                Рынки
              </div>
              <div className="p-2 text-sm">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1 text-xs text-slate-500 border-b">
                  <span>Пара</span>
                  <span className="text-right">Цена</span>
                  <span className="text-right">Спред</span>
                </div>
                {MARKETS.map((m) => {
                  const snap = snapshots[m.symbol]
                  const bb = snap?.bids?.[0]
                  const ba = snap?.asks?.[0]
                  const midM =
                    bb && ba
                      ? (parseDec(bb.price) + parseDec(ba.price)) / 2
                      : bb
                        ? parseDec(bb.price)
                        : ba
                          ? parseDec(ba.price)
                          : NaN
                  const spr =
                    bb && ba && parseDec(bb.price) > 0
                      ? ((parseDec(ba.price) - parseDec(bb.price)) / parseDec(bb.price)) * 100
                      : 0
                  const isActive = m.symbol === market.symbol
                  return (
                    <button
                      key={m.symbol}
                      type="button"
                      className={`w-full grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-2 rounded-lg text-left hover:bg-slate-50 ${isActive ? "bg-slate-50" : ""}`}
                      style={{ borderLeft: `3px solid ${isActive ? ACCENT : "transparent"}` }}
                      onClick={() => setMarket(m)}
                    >
                      <span className="font-medium">{m.display}</span>
                      <span className="text-right tabular-nums" style={{ color: BUY }}>
                        {Number.isFinite(midM) ? fmtMoney(midM) : "—"}
                      </span>
                      <span className="text-right text-xs text-slate-500 tabular-nums">
                        {Number.isFinite(spr) && spr !== 0 ? `${fmtNum(spr, 3)}%` : "—"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          </aside>

          {/* График (заглушка под TradingView) */}
          <section className="xl:col-span-7">
            <Card className="rounded-xl border-slate-200 shadow-sm h-[420px] flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 border-b bg-white">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={`px-2 py-1 text-xs rounded ${tf === "15M" ? "text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    style={tf === "15M" ? { background: ACCENT } : {}}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <CardContent className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/80 m-3 rounded-lg border border-dashed border-slate-200">
                {loading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                ) : (
                  <p className="text-slate-500 text-sm text-center max-w-sm">
                    График: подключите виджет TradingView или поток свечей. Сейчас отображаются стакан и сделки с
                    order-book-service.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Сделки */}
          <aside className="xl:col-span-3">
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden h-[420px] flex flex-col">
              <div className="px-3 py-2 text-sm font-semibold bg-white border-b flex justify-between items-center">
                <span>Сделки</span>
                <span className="text-xs font-normal text-slate-400">{market.symbol}</span>
              </div>
              <div className="grid grid-cols-4 gap-0 text-[11px] text-slate-500 uppercase px-2 py-1.5 border-b bg-slate-50">
                <span>Цена {market.quote}</span>
                <span className="text-right">{market.base}</span>
                <span className="text-right">{market.quote}</span>
                <span className="text-right">Время</span>
              </div>
              <div className="flex-1 overflow-y-auto text-sm">
                {trades.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Здесь пока пусто</div>
                ) : (
                  trades.map((t) => {
                    const px = parseDec(t.price)
                    const q = parseDec(t.quantity)
                    const quote = parseDec(t.quote) || px * q
                    const col = t.side === "buy" ? BUY : SELL
                    return (
                      <div key={t.id} className="grid grid-cols-4 px-2 py-1 border-b border-slate-100/80 tabular-nums">
                        <span style={{ color: col }}>{fmtMoney(px)}</span>
                        <span className="text-right text-slate-700">{fmtNum(q, 8)}</span>
                        <span className="text-right text-slate-600">{fmtMoney(quote)}</span>
                        <span className="text-right text-xs text-slate-400">
                          {new Date(t.timestamp).toLocaleTimeString("ru-RU")}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </aside>
        </div>

        {/* Стаканы + форма */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <OrderBookPanel
            title="Ордера на продажу"
            accent={SELL}
            rows={asksDisplay}
            sumHeader={`Σ ${market.base}`}
            baseLabel={market.base}
            quoteLabel={market.quote}
            className="lg:col-span-3"
          />
          <div className="lg:col-span-6">
            <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b bg-white">
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium ${orderMode === "limit" ? "text-white" : "text-slate-600"}`}
                  style={{ background: orderMode === "limit" ? ACCENT : "transparent" }}
                  onClick={() => setOrderMode("limit")}
                >
                  Лимит
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 text-sm font-medium ${orderMode === "market" ? "text-white" : "text-slate-600"}`}
                  style={{ background: orderMode === "market" ? ACCENT : "transparent" }}
                  onClick={() => setOrderMode("market")}
                >
                  Маркет
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-4 space-y-3 bg-white">
                  <div className="text-sm font-semibold" style={{ color: BUY }}>
                    Купить {market.base}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Цена ({market.quote})</Label>
                    <Input
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      disabled={orderMode === "market"}
                      className="rounded-lg border-slate-200"
                    />
                    <Label className="text-xs text-slate-500">Количество ({market.base})</Label>
                    <Input value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} className="rounded-lg border-slate-200" />
                    <div className="flex gap-1 pt-1">
                      {[25, 50, 75, 100].map((p) => (
                        <Button
                          key={p}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={() => {
                            /* Без балансов базовых валют в UI процент не рассчитываем. */
                          }}
                        >
                          {p}%
                        </Button>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 pt-1">
                      Итого ≈{" "}
                      {fmtMoney(
                        parseDec(buyAmount) * (orderMode === "market" && Number.isFinite(mid) ? mid : parseDec(buyPrice)),
                      )}{" "}
                      {market.quote} · комиссия {FEE_RATE * 100}%
                    </div>
                  </div>
                  {!usdtWallet ? (
                    <Button asChild className="w-full rounded-lg h-11 text-white shadow" style={{ background: ACCENT }}>
                      <Link href="/login">Авторизация</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-lg h-11 text-white shadow disabled:opacity-60"
                      style={{ background: BUY }}
                      disabled={!!submitting}
                      onClick={() => void place("buy")}
                    >
                      {submitting === "buy" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `Купить ${market.base}`}
                    </Button>
                  )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                  <div className="text-sm font-semibold" style={{ color: SELL }}>
                    Продать {market.base}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">Цена ({market.quote})</Label>
                    <Input
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      disabled={orderMode === "market"}
                      className="rounded-lg border-slate-200"
                    />
                    <Label className="text-xs text-slate-500">Количество ({market.base})</Label>
                    <Input value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} className="rounded-lg border-slate-200" />
                    <div className="text-xs text-slate-500 pt-6">
                      Получите ≈{" "}
                      {fmtMoney(
                        parseDec(sellAmount) * (orderMode === "market" && Number.isFinite(mid) ? mid : parseDec(sellPrice)),
                      )}{" "}
                      {market.quote}
                    </div>
                  </div>
                  {!usdtWallet ? (
                    <Button asChild className="w-full rounded-lg h-11 text-white shadow" style={{ background: ACCENT }}>
                      <Link href="/login">Авторизация</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full rounded-lg h-11 text-white shadow disabled:opacity-60"
                      style={{ background: SELL }}
                      disabled={!!submitting}
                      onClick={() => void place("sell")}
                    >
                      {submitting === "sell" ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `Продать ${market.base}`}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
          <OrderBookPanel
            title="Ордера на покупку"
            accent={BUY}
            rows={bidsDisplay}
            sumHeader={`Σ ${market.quote}`}
            baseLabel={market.base}
            quoteLabel={market.quote}
            className="lg:col-span-3"
          />
        </div>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  valueClass = "text-slate-800",
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <div className="text-slate-500 text-xs">{label}</div>
      <div className={`font-medium tabular-nums ${valueClass}`}>{value}</div>
    </div>
  )
}

function OrderBookPanel({
  title,
  accent,
  rows,
  sumHeader,
  baseLabel,
  quoteLabel,
  className,
}: {
  title: string
  accent: string
  rows: ExchangeOrderBookEntry[]
  sumHeader: string
  baseLabel: string
  quoteLabel: string
  className?: string
}) {
  const sumBase = rows.reduce((s, r) => s + parseDec(r.quantity), 0)
  const sumQuote = rows.reduce((s, r) => s + parseDec(r.quantity) * parseDec(r.price), 0)

  return (
    <Card className={`rounded-xl border-slate-200 shadow-sm overflow-hidden ${className ?? ""}`}>
      <div className="px-3 py-2 flex justify-between items-center text-sm font-semibold bg-white border-b">
        <span>{title}</span>
        <span className="text-xs font-normal tabular-nums text-slate-500">
          {sumHeader}: {title.includes("продажу") ? fmtNum(sumBase, 8) : fmtMoney(sumQuote)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-0 text-[11px] text-slate-500 uppercase px-2 py-1.5 border-b bg-slate-50">
        <span>Цена</span>
        <span className="text-right">{baseLabel}</span>
        <span className="text-right">{quoteLabel}</span>
      </div>
      <div className="max-h-[340px] overflow-y-auto bg-white text-sm">
        {rows.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">Нет заявок</div>
        ) : (
          rows.map((r, i) => {
            const px = parseDec(r.price)
            const q = parseDec(r.quantity)
            const qUsdt = px * q
            return (
              <div key={`${r.price}-${i}`} className="grid grid-cols-3 px-2 py-1 border-b border-slate-50 tabular-nums hover:bg-slate-50/80">
                <span style={{ color: accent }} className="font-medium">
                  {fmtMoney(px)}
                </span>
                <span className="text-right text-slate-700">{fmtNum(q, 8)}</span>
                <span className="text-right text-slate-600">{fmtMoney(qUsdt)}</span>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
