"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Settings,
  Bell,
  Gift,
  CreditCard,
  PieChart,
  BarChart3,
  Activity,
} from "lucide-react"

export default function DashboardPage() {
  const [showBalance, setShowBalance] = useState(true)

  const portfolio = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      amount: "0.15432",
      value: "₽501,540",
      change: "+2.45%",
      positive: true,
      icon: "₿",
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      amount: "2.8934",
      value: "₽583,120",
      change: "+1.82%",
      positive: true,
      icon: "Ξ",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Solana",
      symbol: "SOL",
      amount: "45.67",
      value: "₽339,050",
      change: "+5.23%",
      positive: true,
      icon: "◎",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      amount: "1,250",
      value: "₽45,625",
      change: "-0.95%",
      positive: false,
      icon: "₳",
      color: "bg-green-100 text-green-600",
    },
  ]

  const recentTransactions = [
    { type: "buy", crypto: "BTC", amount: "0.00234", price: "₽7,605", date: "15 дек, 14:32", status: "completed" },
    { type: "sell", crypto: "ETH", amount: "0.5", price: "₽100,750", date: "14 дек, 09:15", status: "completed" },
    { type: "buy", crypto: "SOL", amount: "10", price: "₽74,250", date: "13 дек, 16:45", status: "pending" },
    { type: "deposit", crypto: "RUB", amount: "50,000", price: "₽50,000", date: "12 дек, 11:20", status: "completed" },
  ]

  const quickActions = [
    { title: "Купить криптовалюту", description: "Быстрая покупка", icon: Plus, color: "bg-green-500", href: "/buy" },
    { title: "Продать активы", description: "Продажа криптовалют", icon: Minus, color: "bg-red-500", href: "/sell" },
    {
      title: "Пополнить баланс",
      description: "Добавить средства",
      icon: CreditCard,
      color: "bg-blue-500",
      href: "/deposit",
    },
    { title: "Вывести средства", description: "Снять деньги", icon: Wallet, color: "bg-purple-500", href: "/withdraw" },
  ]

  const marketData = [
    { name: "Bitcoin", symbol: "BTC", price: "₽3,250,000", change: "+2.45%", positive: true },
    { name: "Ethereum", symbol: "ETH", price: "₽201,500", change: "+1.82%", positive: true },
    { name: "Solana", symbol: "SOL", price: "₽7,425", change: "+5.23%", positive: true },
    { name: "Cardano", symbol: "ADA", price: "₽36.50", change: "-0.95%", positive: false },
  ]

  const totalBalance = "₽1,469,335"
  const totalChange = "+3.2%"
  const totalChangeAmount = "+₽45,230"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать, Иван!</h1>
              <p className="text-gray-600 mt-1">Вот обзор вашего портфеля на сегодня</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Уведомления
                <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">3</Badge>
              </Button>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Общий баланс</p>
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
                  <p className="text-blue-100 text-sm">
                    {totalChange} ({totalChangeAmount})
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">24ч Изменение</p>
                  <p className="text-2xl font-bold text-green-600">+₽45,230</p>
                  <p className="text-gray-500 text-sm">+3.2%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Активных позиций</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                  <p className="text-gray-500 text-sm">Криптовалют</p>
                </div>
                <PieChart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Сделок за месяц</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                  <p className="text-gray-500 text-sm">+12 за неделю</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Мой портфель</CardTitle>
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm">
                      Подробнее
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.map((asset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${asset.color} rounded-full flex items-center justify-center`}>
                          <span className="text-lg font-bold">{asset.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                          <p className="text-sm text-gray-500">
                            {asset.amount} {asset.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{showBalance ? asset.value : "••••••"}</div>
                        <div className={`text-sm ${asset.positive ? "text-green-600" : "text-red-600"}`}>
                          {asset.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Последние операции</CardTitle>
                  <Link href="/transactions">
                    <Button variant="outline" size="sm">
                      Все операции
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "buy" ? "bg-green-100" : tx.type === "sell" ? "bg-red-100" : "bg-blue-100"
                          }`}
                        >
                          {tx.type === "buy" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : tx.type === "sell" ? (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          ) : (
                            <Wallet className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {tx.type === "buy" ? "Покупка" : tx.type === "sell" ? "Продажа" : "Пополнение"} {tx.crypto}
                          </h3>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {tx.type === "deposit" ? "+" : ""}
                          {tx.amount} {tx.crypto}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{tx.price}</span>
                          <Badge
                            className={`${
                              tx.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {tx.status === "completed" ? "Завершено" : "В обработке"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Обзор рынка</CardTitle>
                  <Link href="/markets">
                    <Button variant="ghost" size="sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData.map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{crypto.symbol}</h4>
                        <p className="text-sm text-gray-500">{crypto.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{crypto.price}</div>
                        <div className={`text-sm ${crypto.positive ? "text-green-600" : "text-red-600"}`}>
                          {crypto.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Доходность портфеля</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">График доходности</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Gift className="w-6 h-6" />
                  <h3 className="font-semibold">Реферальная программа</h3>
                </div>
                <p className="text-purple-100 text-sm mb-4">Приглашайте друзей и получайте до 40% от их комиссий</p>
                <Link href="/referral">
                  <Button variant="secondary" size="sm" className="w-full">
                    Пригласить друзей
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* News & Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Новости</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm">Новая функция: Автоинвестирование</h4>
                    <p className="text-blue-700 text-xs mt-1">Настройте автоматические покупки криптовалют</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 text-sm">Снижение комиссий на 50%</h4>
                    <p className="text-green-700 text-xs mt-1">Торгуйте с минимальными комиссиями до конца месяца</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
