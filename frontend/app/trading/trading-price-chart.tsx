"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type UTCTimestamp,
} from "lightweight-charts"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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

export const TF_LABELS: ChartTf[] = ["1M", "5M", "15M", "1H", "4H", "1D"]

const TV_UP = "#089981"
const TV_DOWN = "#f23645"
const TV_GRID = "#f0f3fa"
const TV_BORDER = "#e0e3eb"

function parseTradeNum(s: string): number {
  const n = Number.parseFloat(String(s).replace(/\s/g, "").replace(",", "."))
  return Number.isFinite(n) ? n : NaN
}

export interface CandleRow {
  t: number
  open: number
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
    const tsMs = new Date(tr.timestamp).getTime()
    if (!Number.isFinite(tsMs)) continue
    const bucket = Math.floor(tsMs / intervalMs) * intervalMs
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
      open: agg.open,
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

function toTs(ms: number): UTCTimestamp {
  return Math.floor(ms / 1000) as UTCTimestamp
}

function fmtPrice(n: number, digitsHint?: number): string {
  if (!Number.isFinite(n)) return "—"
  const abs = Math.abs(n)
  const maxFrac =
    digitsHint ?? (abs >= 1000 ? 2 : abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8)
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFrac,
  }).format(n)
}

function fmtVolCompact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—"
  if (n >= 1e6) return `${(n / 1e6).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}М`
  if (n >= 1e3) return `${(n / 1e3).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}К`
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 4 })
}

interface TradingPriceChartProps {
  /** Подпись пары, напр. BTC/USDT */
  pairLabel: string
  trades: ExchangeTrade[]
  quote: string
  midFallback: number
  loading: boolean
}

type OhlcRow = Pick<CandleRow, "open" | "high" | "low" | "close" | "volume" | "t">

export function TradingPriceChart({ pairLabel, trades, quote, midFallback, loading }: TradingPriceChartProps) {
  const [tf, setTf] = useState<ChartTf>("15M")
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null)

  const [hover, setHover] = useState<OhlcRow | null>(null)

  const intervalMs = TF_MS[tf]

  const rows = useMemo(() => {
    const candles = tradesToCandles(trades, intervalMs)
    if (candles.length > 0) return candles
    if (Number.isFinite(midFallback)) {
      const now = Date.now()
      return [
        {
          t: now - intervalMs,
          open: midFallback,
          close: midFallback,
          high: midFallback,
          low: midFallback,
          volume: 0,
          timeLabel: "—",
        },
        {
          t: now,
          open: midFallback,
          close: midFallback,
          high: midFallback,
          low: midFallback,
          volume: 0,
          timeLabel: "Сейчас",
        },
      ]
    }
    return []
  }, [trades, intervalMs, midFallback])

  const candleData: CandlestickData[] = useMemo(
    () =>
      rows.map((r) => ({
        time: toTs(r.t),
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
      })),
    [rows],
  )

  const volumeData: HistogramData[] = useMemo(
    () =>
      rows.map((r) => {
        const up = r.close >= r.open
        return {
          time: toTs(r.t),
          value: r.volume,
          color: up ? `${TV_UP}99` : `${TV_DOWN}99`,
        }
      }),
    [rows],
  )

  const totalVol = useMemo(() => rows.reduce((s, r) => s + r.volume, 0), [rows])

  const lastRow = rows.length > 0 ? rows[rows.length - 1] : null
  const displayRow = hover ?? lastRow

  const delta =
    displayRow && Number.isFinite(displayRow.open) && displayRow.open !== 0
      ? displayRow.close - displayRow.open
      : NaN
  const deltaPct =
    displayRow && Number.isFinite(displayRow.open) && displayRow.open !== 0
      ? ((displayRow.close - displayRow.open) / displayRow.open) * 100
      : NaN

  const onCrosshair = useCallback(
    (param: MouseEventParams) => {
      const series = candleRef.current
      if (!param.time || !series) {
        setHover(null)
        return
      }
      const d = param.seriesData.get(series) as CandlestickData | undefined
      if (d && "open" in d) {
        const tSec = typeof param.time === "number" ? (param.time as number) * 1000 : 0
        const volPt = volumeRef.current ? (param.seriesData.get(volumeRef.current) as HistogramData | undefined) : undefined
        setHover({
          t: tSec,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: volPt?.value ?? 0,
        })
      } else {
        setHover(null)
      }
    },
    [],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el || loading || rows.length === 0) return

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#131722",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", "Helvetica Neue", Arial, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: TV_GRID, visible: true },
        horzLines: { color: TV_GRID, visible: true },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { width: 1, style: 2, color: "#9598a1" },
        horzLine: { width: 1, style: 2, color: "#9598a1" },
      },
      rightPriceScale: {
        borderColor: TV_BORDER,
        scaleMargins: { top: 0.06, bottom: 0.2 },
      },
      timeScale: {
        borderColor: TV_BORDER,
        timeVisible: tf === "1M" || tf === "5M" || tf === "15M",
        secondsVisible: tf === "1M",
      },
    })

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: TV_UP,
      downColor: TV_DOWN,
      borderUpColor: TV_UP,
      borderDownColor: TV_DOWN,
      wickUpColor: TV_UP,
      wickDownColor: TV_DOWN,
    })

    candles.setData(candleData)

    const histogram = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        base: 0,
      },
      0,
    )
    histogram.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })
    histogram.setData(volumeData)

    chart.subscribeCrosshairMove(onCrosshair)
    chart.timeScale().fitContent()

    chartRef.current = chart
    candleRef.current = candles
    volumeRef.current = histogram

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr || !chartRef.current) return
      chartRef.current.applyOptions({ width: Math.floor(cr.width), height: Math.floor(cr.height) })
    })
    ro.observe(el)
    const rect = el.getBoundingClientRect()
    chart.applyOptions({
      width: Math.floor(rect.width || el.clientWidth),
      height: Math.floor(rect.height || el.clientHeight),
    })

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      candleRef.current = null
      volumeRef.current = null
      setHover(null)
    }
  }, [loading, rows.length, tf, onCrosshair])

  useEffect(() => {
    if (!chartRef.current || !candleRef.current || !volumeRef.current || loading || rows.length === 0) return
    candleRef.current.setData(candleData)
    volumeRef.current.setData(volumeData)
    chartRef.current.timeScale().fitContent()
  }, [candleData, volumeData, loading, rows.length])

  const noTrades = trades.length === 0

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm min-h-[520px] flex flex-col overflow-hidden">
      {/* Верхняя панель в духе TradingView */}
      <div className="border-b bg-white px-3 py-2 space-y-2 shrink-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-[#131722]">
            {pairLabel} · {tf}
          </span>
          {displayRow && (
            <>
              <span className="text-xs text-slate-600">
                ОТКР{" "}
                <span className="font-mono tabular-nums text-[#131722]">{fmtPrice(displayRow.open)}</span>
              </span>
              <span className="text-xs text-slate-600">
                МАКС{" "}
                <span className="font-mono tabular-nums text-[#131722]">{fmtPrice(displayRow.high)}</span>
              </span>
              <span className="text-xs text-slate-600">
                МИН{" "}
                <span className="font-mono tabular-nums text-[#131722]">{fmtPrice(displayRow.low)}</span>
              </span>
              <span className="text-xs text-slate-600">
                ЗАКР{" "}
                <span className="font-mono tabular-nums text-[#131722]">{fmtPrice(displayRow.close)}</span>
              </span>
              <span
                className={`text-xs font-mono tabular-nums ${
                  !Number.isFinite(delta)
                    ? "text-slate-400"
                    : delta >= 0
                      ? "text-[#089981]"
                      : "text-[#f23645]"
                }`}
              >
                {Number.isFinite(delta) ? `${delta >= 0 ? "+" : ""}${fmtPrice(delta)}` : "—"}{" "}
                ({Number.isFinite(deltaPct) ? `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%` : "—"})
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="text-[11px] text-slate-500">
            Объём базы за видимые свечи:{" "}
            <span className="font-mono text-[#131722]">{fmtVolCompact(hover?.volume ?? totalVol)}</span> · {quote}{" "}
            {hover && <span className="text-slate-400">(под указателем — объём свечи)</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-2 hidden sm:inline">Таймфрейм:</span>
            {TF_LABELS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setTf(x)}
                className={`px-2 py-1 text-xs rounded border ${x === tf ? "text-white border-transparent" : "text-slate-600 border-transparent hover:bg-slate-100"}`}
                style={x === tf ? { background: "#2962FF" } : {}}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Вторичный тулбар (декоративные кнопки как на скрине) */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b bg-[#fafafa] text-[11px] text-slate-500">
        <button type="button" disabled className="opacity-45 cursor-not-allowed px-2 py-0.5 rounded hover:bg-transparent">
          Сравнить
        </button>
        <button type="button" disabled className="opacity-45 cursor-not-allowed px-2 py-0.5 rounded">
          Индикаторы
        </button>
        <span className="text-slate-300">|</span>
        <span className="text-slate-400">
          {noTrades
            ? "Нет истории сделок — показаны синтетические свечи по цене mid стакана"
            : "Свечи и объём агрегированы из ленты сделок (order-book-service)"}
        </span>
      </div>

      <CardContent className="flex-1 min-h-[380px] p-0 relative">
        {loading ? (
          <div className="h-[380px] flex items-center justify-center bg-white">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="h-[380px] flex items-center justify-center bg-white px-4">
            <p className="text-slate-500 text-sm text-center max-w-sm">
              Нет данных для графика: дождитесь сделок или появления котировок в стакане.
            </p>
          </div>
        ) : (
          <div ref={containerRef} className="h-[380px] w-full min-h-[320px]" />
        )}
      </CardContent>
      <div className="px-2 py-1 border-t bg-white text-[10px] text-slate-400 flex justify-between">
        <span>Lightweight Charts — библиотека TradingView (открытая лицензия)</span>
        <span className="opacity-70">Свечи: {candleData.length}</span>
      </div>
    </Card>
  )
}
