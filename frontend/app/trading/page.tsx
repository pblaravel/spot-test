"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Volume2, Clock, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient, SpotOrderBook, SpotTicker, SpotTrade, Wallet } from "@/lib/api-client"

const TRADING_PAIR = "BTC/USDT"
const FEE_RATE = 0.001

function formatUsdt(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n)
}

function formatBtc(n: number | undefined, digits = 8): string {
  if (n === undefined || Number.isNaN(n)) return "—"
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(n)
}

function formatPct(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "—"
  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}

export default function TradingPage() {
  const [orderType, setOrderType] = useState("buy")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")
  const [orderMode, setOrderMode] = useState("limit")

  const [ticker, setTicker] = useState<SpotTicker | null>(null)
  const [orderBook, setOrderBook] = useState<SpotOrderBook | null>(null)
  const [trades, setTrades] = useState<SpotTrade[]>([])
  const [usdtWallet, setUsdtWallet] = useState<Wallet | null>(null)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [loadingMarket, setLoadingMarket] = useState(true)
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [orderSubmitting, setOrderSubmitting] = useState(false)

  const loadMarket = useCallback(async () => {
    setLoadingMarket(true)
    setMarketError(null)
    try {
      const [tRes, obRes, trRes] = await Promise.all([
        apiClient.getSpotTicker(TRADING_PAIR),
        apiClient.getSpotOrderBook(TRADING_PAIR, 12),
        apiClient.getSpotTrades(TRADING_PAIR, 8),
      ])
      if (tRes.error || !tRes.data) {
        setMarketError(tRes.error || "Не удалось загрузить тикер")
        return
      }
      if (obRes.error || !obRes.data) {
        setMarketError(obRes.error || "Не удалось загрузить стакан")
        return
      }
      setTicker(tRes.data)
      setOrderBook(obRes.data)
      setTrades(trRes.data && !trRes.error ? trRes.data : [])
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "Ошибка загрузки рынка")
    } finally {
      setLoadingMarket(false)
    }
  }, [])

  const loadWallet = useCallback(async () => {
    setLoadingWallet(true)
    setWalletError(null)
    const wRes = await apiClient.getMyUsdtWallet()
    if (wRes.error || !wRes.data) {
      setUsdtWallet(null)
      setWalletError(wRes.error || "Войдите, чтобы увидеть баланс USDT")
    } else {
      setUsdtWallet(wRes.data)
    }
    setLoadingWallet(false)
  }, [])

  useEffect(() => {
    void loadMarket()
    const id = setInterval(() => void loadMarket(), 5000)
    return () => clearInterval(id)
  }, [loadMarket])

  useEffect(() => {
    void loadWallet()
  }, [loadWallet])

  useEffect(() => {
    if (orderMode === "limit" && !price.trim() && ticker?.last !== undefined) {
      setPrice(String(ticker.last))
    }
  }, [orderMode, ticker?.last, price])

  const lastPrice = ticker?.last
  const limitPriceNum = Number.parseFloat(price.replace(/\s/g, "").replace(",", "."))
  const amountNum = Number.parseFloat(amount.replace(/\s/g, "").replace(",", "."))
  const effectivePrice =
    orderMode === "market" && lastPrice !== undefined ? lastPrice : limitPriceNum

  const estimatedCost =
    Number.isFinite(amountNum) && Number.isFinite(effectivePrice) ? amountNum * effectivePrice : NaN
  const estimatedFee = Number.isFinite(estimatedCost) ? estimatedCost * FEE_RATE : NaN

  const bidRows = useMemo(() => (orderBook?.bids ?? []).slice(0, 6), [orderBook])
  const askRows = useMemo(() => (orderBook?.asks ?? []).slice(0, 6).reverse(), [orderBook])

  const placeOrder = async (side: "buy" | "sell") => {
    if (!usdtWallet) {
      toast.error("Войдите в аккаунт, чтобы выставить ордер")
      return
    }
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Укажите количество BTC больше нуля")
      return
    }
    const type = orderMode === "market" ? "market" : "limit"
    const limitPx =
      orderMode === "limit"
        ? (Number.isFinite(limitPriceNum) && limitPriceNum > 0 ? limitPriceNum : lastPrice)
        : undefined
    if (type === "limit" && (limitPx === undefined || !Number.isFinite(limitPx) || limitPx <= 0)) {
      toast.error("Укажите цену лимитного ордера")
      return
    }
    setOrderSubmitting(true)
    try {
      const res = await apiClient.createSpotOrder({
        symbol: TRADING_PAIR,
        type,
        side,
        amount: amountNum,
        price: type === "limit" ? limitPx : undefined,
      })
      if (res.error || !res.data) {
        toast.error(res.error || "Не удалось создать ордер")
        return
      }
      const id = String((res.data as { id?: string }).id ?? "")
      toast.success(side === "buy" ? "Ордер на покупку отправлен" : "Ордер на продажу отправлен", {
        description: id ? `ID: ${id}` : undefined,
      })
    } finally {
      setOrderSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Торговля</h1>
            <div className="flex items-center space-x-4">
              {loadingWallet ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Баланс…
                </Badge>
              ) : usdtWallet ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  USDT: {formatUsdt(Number(usdtWallet.balance))}
                  {Number(usdtWallet.lockedBalance) > 0 && (
                    <span className="ml-1 text-xs opacity-80">
                      (заблок.: {formatUsdt(Number(usdtWallet.lockedBalance))})
                    </span>
                  )}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-800 border-amber-200 bg-amber-50">
                  {walletError || "Нет данных кошелька"}
                </Badge>
              )}
              <Button variant="outline" size="sm" type="button" onClick={() => void loadWallet()}>
                Обновить баланс
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {marketError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {marketError}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700">₿</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Bitcoin (BTC)</h2>
                      <p className="text-gray-500">{TRADING_PAIR}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {loadingMarket && !ticker ? (
                      <Loader2 className="ml-auto h-8 w-8 animate-spin text-gray-400" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900">{formatUsdt(lastPrice)}</div>
                        <div
                          className={`flex items-center ${
                            (ticker?.percentage ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {(ticker?.percentage ?? 0) >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          )}
                          <span className="font-medium">{formatPct(ticker?.percentage)}</span>
                          {ticker?.change !== undefined && (
                            <span className="ml-2 text-sm opacity-80">
                              ({ticker.change >= 0 ? "+" : ""}
                              {formatUsdt(ticker.change)})
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Стакан (живые данные)</CardTitle>
                  <Button variant="outline" size="sm" type="button" onClick={() => void loadMarket()}>
                    Обновить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="mb-2 font-medium text-red-700">Продажа (asks)</div>
                    <div className="space-y-1 font-mono">
                      {askRows.map(([p, q], i) => (
                        <div key={`a-${i}`} className="flex justify-between text-red-700/90">
                          <span>{formatUsdt(p)}</span>
                          <span className="text-gray-600">{formatBtc(q, 6)}</span>
                        </div>
                      ))}
                      {!askRows.length && <span className="text-gray-400">Нет данных</span>}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 font-medium text-green-700">Покупка (bids)</div>
                    <div className="space-y-1 font-mono">
                      {bidRows.map(([p, q], i) => (
                        <div key={`b-${i}`} className="flex justify-between text-green-700/90">
                          <span>{formatUsdt(p)}</span>
                          <span className="text-gray-600">{formatBtc(q, 6)}</span>
                        </div>
                      ))}
                      {!bidRows.length && <span className="text-gray-400">Нет данных</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Объём 24ч (база)</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatBtc(ticker?.baseVolume, 4)} BTC</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Максимум 24ч</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatUsdt(ticker?.high)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Минимум 24ч</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatUsdt(ticker?.low)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Объём 24ч (USDT)</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">{formatUsdt(ticker?.quoteVolume)}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Торговая панель</CardTitle>
                <p className="text-xs text-gray-500">
                  Котировки и стакан — с публичного рынка. Ордер уходит на API биржи (демо-режим без полного matching).
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy" className="text-green-600 data-[state=active]:bg-green-50">
                      Купить
                    </TabsTrigger>
                    <TabsTrigger value="sell" className="text-red-600 data-[state=active]:bg-red-50">
                      Продать
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buy" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="buy-amount">Количество BTC</Label>
                        <Input
                          id="buy-amount"
                          placeholder="0.00000000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="buy-price">Цена (USDT)</Label>
                        <Input
                          id="buy-price"
                          placeholder={lastPrice ? String(lastPrice) : "—"}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={orderMode === "market"}
                        />
                      </div>
                      <div>
                        <Label>Тип ордера</Label>
                        <Select value={orderMode} onValueChange={setOrderMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Рыночный</SelectItem>
                            <SelectItem value="limit">Лимитный</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Комиссия ({FEE_RATE * 100}%)</span>
                          <span className="text-gray-900">
                            {Number.isFinite(estimatedFee) ? formatUsdt(estimatedFee) : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-500">Итого (оценка)</span>
                          <span className="font-bold text-gray-900">
                            {Number.isFinite(estimatedCost) ? formatUsdt(estimatedCost + estimatedFee) : "—"}
                          </span>
                        </div>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          type="button"
                          disabled={orderSubmitting || !usdtWallet}
                          onClick={() => void placeOrder("buy")}
                        >
                          {orderSubmitting ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Отправка…
                            </span>
                          ) : (
                            "Купить BTC"
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sell-amount">Количество BTC</Label>
                        <Input
                          id="sell-amount"
                          placeholder="0.00000000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sell-price">Цена (USDT)</Label>
                        <Input
                          id="sell-price"
                          placeholder={lastPrice ? String(lastPrice) : "—"}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={orderMode === "market"}
                        />
                      </div>
                      <div>
                        <Label>Тип ордера</Label>
                        <Select value={orderMode} onValueChange={setOrderMode}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Рыночный</SelectItem>
                            <SelectItem value="limit">Лимитный</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Комиссия ({FEE_RATE * 100}%)</span>
                          <span className="text-gray-900">
                            {Number.isFinite(estimatedFee) ? formatUsdt(estimatedFee) : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-500">Получите (оценка)</span>
                          <span className="font-bold text-gray-900">
                            {Number.isFinite(estimatedCost) ? formatUsdt(estimatedCost - estimatedFee) : "—"}
                          </span>
                        </div>
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          type="button"
                          disabled={orderSubmitting || !usdtWallet}
                          onClick={() => void placeOrder("sell")}
                        >
                          {orderSubmitting ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Отправка…
                            </span>
                          ) : (
                            "Продать BTC"
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Последние сделки (рынок)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            trade.side === "buy"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }
                        >
                          {trade.side === "buy" ? "Покупка" : "Продажа"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(trade.timestamp).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-right font-mono text-sm">
                        <div className="font-medium">
                          {formatBtc(trade.amount, 6)} BTC @ {formatUsdt(trade.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!trades.length && !loadingMarket && (
                    <p className="text-sm text-gray-500">Нет сделок в ответе API</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
