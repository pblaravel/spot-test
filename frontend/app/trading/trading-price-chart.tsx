"use client"

import { useId, useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ExchangeTrade } from "@/lib/api-client"

export type ChartTf = "1M" | "5M" | "15M" | "1H" | "4H" | "1D"

const TF_MS: Record<ChartTf, number> = {
  "1M": 60_000,
  "5M": 5 * 60_000,
  "15M": 15 * 60_000,
  "1H": 60 * 60_000,
  "4H": 4 * 60 * 60_000,
  "1D": 24 * 60 * 60_000,
}

const TF_LABELS: ChartTf[] = ["1M", "5M", "15M", "1H", "4H", "1D"]

function parseTradeNum(s: string): number {
  const n = Number.parseFloat(String(s).replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(n) ? n : NaN
}

export interface CandleRow {
  t: number
  close: number
  high: number
  low: number
  volume: number
  timeLabel: string
}

export function tradesToCandles(trades: ExchangeTrade[], intervalMs: number): CandleRow[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )
  if (sorted.length === 0) return []

  type Agg = { open: number; high: number; low: number; close: number; vol: number }
  const map = new Map<number, Agg>()

  for (const tr of sorted) {
    const ts = new Date(tr.timestamp).getTime()
    if (!Number.isFinite(ts)) continue
    const bucket = Math.floor(ts / intervalMs) * intervalMs
    const price = parseTradeNum(tr.price)
    const qty = parseTradeNum(tr.quantity)
    if (!Number.isFinite(price)) continue

    const agg = map.get(bucket)
    if (!agg) {
      map.set(bucket, {
        open: price,
        high: price,
        low: price,
        close: price,
        vol: Number.isFinite(qty) ? qty : 0,
      })
    } else {
      agg.high = Math.max(agg.high, price)
      agg.low = Math.min(agg.low, price)
      agg.close = price
      if (Number.isFinite(qty)) agg.vol += qty
    }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([bucket, agg]) => ({
      t: bucket,
      close: agg.close,
      high: agg.high,
      low: agg.low,
      volume: agg.vol,
      timeLabel: formatBucketLabel(bucket, intervalMs),
    }))
}

function formatBucketLabel(bucketMs: number, intervalMs: number): string {
  const d = new Date(bucketMs)
  if (intervalMs >= TF_MS["1D"]) {
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
  }
  if (intervalMs >= TF_MS["1H"]) {
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function fmtAxisPrice(n: number): string {
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: n >= 1000 ? 2 : 6,
  }).format(n)
}

interface TradingPriceChartProps {
  trades: ExchangeTrade[]
  quote: string
  accent: string
  midFallback: number
  loading: boolean
}

export function TradingPriceChart({ trades, quote, accent, midFallback, loading }: TradingPriceChartProps) {
  const [tf, setTf] = useState<ChartTf>("15M")
  const gradientId = `tc-${useId().replace(/:/g, "")}`

  const intervalMs = TF_MS[tf]

  const chartData = useMemo(() => {
    const candles = tradesToCandles(trades, intervalMs)
    if (candles.length > 0) {
      return candles
    }
    if (Number.isFinite(midFallback)) {
      const now = Date.now()
      return [
        { t: now - intervalMs, close: midFallback, high: midFallback, low: midFallback, volume: 0, timeLabel: "—" },
        { t: now, close: midFallback, high: midFallback, low: midFallback, volume: 0, timeLabel: "Сейчас" },
      ]
    }
    return []
  }, [trades, intervalMs, midFallback])

  const chartConfig = {
    close: {
      label: `Цена (${quote})`,
      color: accent,
    },
  } satisfies ChartConfig

  const noTrades = trades.length === 0

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm h-[420px] flex flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-white flex-wrap">
        <div className="flex items-center gap-2">
          {TF_LABELS.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setTf(x)}
              className={`px-2 py-1 text-xs rounded ${x === tf ? "text-white" : "text-slate-600 hover:bg-slate-100"}`}
              style={x === tf ? { background: accent } : {}}
            >
              {x}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          {noTrades ? "Нет сделок — линия по mid стакана" : "Свечи по ленте сделок (O/H/L/C в интервале)"}
        </span>
      </div>
      <CardContent className="flex-1 min-h-0 pt-3 px-2 pb-2">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-lg border border-slate-100">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-lg border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm text-center max-w-sm px-4">
              Нет данных для графика: дождитесь сделок или появления котировок в стакане.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full min-h-[320px] aspect-auto [&_.recharts-surface]:outline-none">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="timeLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                className="text-[10px]"
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={72}
                tickFormatter={fmtAxisPrice}
                className="text-[10px]"
              />
              <ChartTooltip
                cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: "4 4" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as CandleRow | undefined
                      return row?.timeLabel ?? ""
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={accent}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={chartData.length <= 24 ? { r: 3, fill: accent, strokeWidth: 0 } : false}
                activeDot={{ r: 4, fill: accent }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
