"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Volume2, Clock, DollarSign } from "lucide-react"

export default function TradingPage() {
  const [orderType, setOrderType] = useState("buy")
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Торговля</h1>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-50 text-green-700 border-green-200">Баланс: ₽125,430.50</Badge>
              <Button variant="outline" size="sm">
                Пополнить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Trading Chart Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Price */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-700">₿</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Bitcoin (BTC)</h2>
                      <p className="text-gray-500">BTC/RUB</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">₽3,250,000</div>
                    <div className="flex items-center text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span className="font-medium">+2.45% (+77,500)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Chart Placeholder */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>График цены</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      1Ч
                    </Button>
                    <Button variant="outline" size="sm">
                      4Ч
                    </Button>
                    <Button variant="outline" size="sm" className="bg-black text-white">
                      1Д
                    </Button>
                    <Button variant="outline" size="sm">
                      1Н
                    </Button>
                    <Button variant="outline" size="sm">
                      1М
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">График торговли</p>
                    <p className="text-sm text-gray-400">Здесь будет отображаться интерактивный график цены</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">24ч Объем</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">₽2.1B</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">24ч Максимум</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">₽3,285,000</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowDownRight className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">24ч Минимум</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">₽3,180,000</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Рын. капитализация</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">₽64.2T</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Торговая панель</CardTitle>
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
                        <Label htmlFor="buy-price">Цена за BTC</Label>
                        <Input
                          id="buy-price"
                          placeholder="3,250,000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Тип ордера</Label>
                        <Select defaultValue="market">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Рыночный</SelectItem>
                            <SelectItem value="limit">Лимитный</SelectItem>
                            <SelectItem value="stop">Стоп-лосс</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Комиссия (0.1%)</span>
                          <span className="text-gray-900">₽3,250</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-500">Итого</span>
                          <span className="font-bold text-gray-900">₽3,253,250</span>
                        </div>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Купить BTC</Button>
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
                        <Label htmlFor="sell-price">Цена за BTC</Label>
                        <Input
                          id="sell-price"
                          placeholder="3,250,000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Тип ордера</Label>
                        <Select defaultValue="market">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="market">Рыночный</SelectItem>
                            <SelectItem value="limit">Лимитный</SelectItem>
                            <SelectItem value="stop">Стоп-лосс</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Комиссия (0.1%)</span>
                          <span className="text-gray-900">₽3,250</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-500">Получите</span>
                          <span className="font-bold text-gray-900">₽3,246,750</span>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Продать BTC</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Последние ордера
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "buy", amount: "0.00154", price: "₽3,245,000", time: "14:32" },
                    { type: "sell", amount: "0.00089", price: "₽3,248,000", time: "14:28" },
                    { type: "buy", amount: "0.00234", price: "₽3,242,000", time: "14:25" },
                  ].map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`${order.type === "buy" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                        >
                          {order.type === "buy" ? "Покупка" : "Продажа"}
                        </Badge>
                        <span className="text-sm text-gray-600">{order.time}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{order.amount} BTC</div>
                        <div className="text-xs text-gray-500">{order.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
