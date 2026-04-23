"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Eye,
  EyeOff,
  PieChart,
  BarChart3,
  Activity,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react"

export default function PortfolioPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [timeframe, setTimeframe] = useState("1D")

  const portfolio = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      amount: "0.15432",
      value: "₽501,540",
      change: "+2.45%",
      changeAmount: "+₽12,300",
      positive: true,
      icon: "₿",
      color: "bg-orange-100 text-orange-600",
      allocation: 34.1,
      avgBuyPrice: "₽3,180,000",
      totalInvested: "₽489,240",
      profit: "+₽12,300",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      amount: "2.8934",
      value: "₽583,120",
      change: "+1.82%",
      changeAmount: "+₽10,450",
      positive: true,
      icon: "Ξ",
      color: "bg-blue-100 text-blue-600",
      allocation: 39.7,
      avgBuyPrice: "₽195,500",
      totalInvested: "₽572,670",
      profit: "+₽10,450",
    },
    {
      name: "Solana",
      symbol: "SOL",
      amount: "45.67",
      value: "₽339,050",
      change: "+5.23%",
      changeAmount: "+₽16,850",
      positive: true,
      icon: "◎",
      color: "bg-purple-100 text-purple-600",
      allocation: 23.1,
      avgBuyPrice: "₽7,060",
      totalInvested: "₽322,200",
      profit: "+₽16,850",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      amount: "1,250",
      value: "₽45,625",
      change: "-0.95%",
      changeAmount: "-₽437",
      positive: false,
      icon: "₳",
      color: "bg-green-100 text-green-600",
      allocation: 3.1,
      avgBuyPrice: "₽37.20",
      totalInvested: "₽46,062",
      profit: "-₽437",
    },
  ]

  const totalBalance = "₽1,469,335"
  const totalInvested = "₽1,430,172"
  const totalProfit = "+₽39,163"
  const totalProfitPercent = "+2.74%"

  const performanceData = [
    { period: "1 день", value: "+₽12,450", percent: "+0.85%" },
    { period: "1 неделя", value: "+₽28,900", percent: "+2.01%" },
    { period: "1 месяц", value: "+₽156,780", percent: "+11.94%" },
    { period: "3 месяца", value: "+₽234,560", percent: "+19.06%" },
    { period: "1 год", value: "+₽567,890", percent: "+63.02%" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Мой портфель</h1>
              <p className="text-gray-600 mt-1">Обзор ваших криптовалютных активов и их доходности</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Общая стоимость</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{showBalance ? totalBalance : "••••••••"}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-blue-400"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <PieChart className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Общая прибыль</p>
                  <p className="text-2xl font-bold text-green-600">{totalProfit}</p>
                  <p className="text-gray-500 text-sm">{totalProfitPercent}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Инвестировано</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInvested}</p>
                  <p className="text-gray-500 text-sm">Всего вложено</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Активов</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                  <p className="text-gray-500 text-sm">Криптовалют</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="holdings">Активы</TabsTrigger>
            <TabsTrigger value="allocation">Распределение</TabsTrigger>
            <TabsTrigger value="performance">Доходность</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Мои активы</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Купить
                    </Button>
                    <Button size="sm" variant="outline">
                      <Minus className="w-4 h-4 mr-2" />
                      Продать
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.map((asset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${asset.color} rounded-full flex items-center justify-center`}>
                          <span className="text-lg font-bold">{asset.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{asset.name}</h3>
                          <p className="text-gray-500">
                            {asset.amount} {asset.symbol}
                          </p>
                          <p className="text-sm text-gray-400">Средняя цена: {asset.avgBuyPrice}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-lg">
                          {showBalance ? asset.value : "••••••"}
                        </div>
                        <div className={`text-sm font-medium ${asset.positive ? "text-green-600" : "text-red-600"}`}>
                          {asset.change} ({asset.changeAmount})
                        </div>
                        <div className={`text-sm ${asset.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          Прибыль: {asset.profit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Распределение портфеля</CardTitle>
                  <CardDescription>Процентное соотношение активов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.map((asset, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${asset.color} rounded-full`}></div>
                            <span className="font-medium">{asset.name}</span>
                          </div>
                          <span className="font-semibold">{asset.allocation}%</span>
                        </div>
                        <Progress value={asset.allocation} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Диверсификация</CardTitle>
                  <CardDescription>Рекомендации по балансировке</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Хорошая диверсификация</h4>
                      <p className="text-blue-700 text-sm">
                        Ваш портфель хорошо диверсифицирован между топовыми криптовалютами
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Рекомендация</h4>
                      <p className="text-yellow-700 text-sm">
                        Рассмотрите добавление стейблкоинов для снижения волатильности
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-medium">Целевое распределение:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Bitcoin (BTC)</span>
                          <span className="text-gray-500">30-40%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ethereum (ETH)</span>
                          <span className="text-gray-500">25-35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Альткоины</span>
                          <span className="text-gray-500">20-30%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Стейблкоины</span>
                          <span className="text-gray-500">10-15%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Доходность по периодам</CardTitle>
                  <CardDescription>Изменение стоимости портфеля</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">{period.period}</span>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{period.value}</div>
                          <div className="text-sm text-green-600">{period.percent}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>График доходности</CardTitle>
                  <CardDescription>Динамика изменения портфеля</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">График доходности портфеля</p>
                      <p className="text-sm text-gray-400">Интерактивный график будет здесь</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Статистика торговли</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Всего сделок</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Успешных сделок</span>
                    <span className="font-semibold text-green-600">89 (70%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Средний доход</span>
                    <span className="font-semibold text-green-600">+2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Лучшая сделка</span>
                    <span className="font-semibold text-green-600">+₽23,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Худшая сделка</span>
                    <span className="font-semibold text-red-600">-₽5,670</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Риск-метрики</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Волатильность</span>
                    <span className="font-semibold">15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Макс. просадка</span>
                    <span className="font-semibold text-red-600">-8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Коэффициент Шарпа</span>
                    <span className="font-semibold">1.42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta к BTC</span>
                    <span className="font-semibold">0.85</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VaR (95%)</span>
                    <span className="font-semibold">₽45,230</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Рекомендации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 text-sm">Ребалансировка</h4>
                    <p className="text-green-700 text-xs mt-1">Рассмотрите продажу части ETH</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm">Диверсификация</h4>
                    <p className="text-blue-700 text-xs mt-1">Добавьте стейблкоины</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 text-sm">DCA стратегия</h4>
                    <p className="text-yellow-700 text-xs mt-1">Настройте автоинвестирование</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
