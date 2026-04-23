"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const transactions = [
    {
      id: "TX001",
      type: "buy",
      crypto: "BTC",
      amount: "0.00234",
      price: "₽7,605",
      total: "₽7,605",
      date: "15 дек 2024, 14:32",
      status: "completed",
      fee: "₽7.60",
      hash: "0x1234...5678",
    },
    {
      id: "TX002",
      type: "sell",
      crypto: "ETH",
      amount: "0.5",
      price: "₽100,750",
      total: "₽100,750",
      date: "14 дек 2024, 09:15",
      status: "completed",
      fee: "₽100.75",
      hash: "0x2345...6789",
    },
    {
      id: "TX003",
      type: "buy",
      crypto: "SOL",
      amount: "10",
      price: "₽74,250",
      total: "₽74,250",
      date: "13 дек 2024, 16:45",
      status: "pending",
      fee: "₽74.25",
      hash: "0x3456...7890",
    },
    {
      id: "TX004",
      type: "deposit",
      crypto: "RUB",
      amount: "50,000",
      price: "₽50,000",
      total: "₽50,000",
      date: "12 дек 2024, 11:20",
      status: "completed",
      fee: "₽0",
      hash: "-",
    },
    {
      id: "TX005",
      type: "withdraw",
      crypto: "RUB",
      amount: "25,000",
      price: "₽25,000",
      total: "₽25,000",
      date: "11 дек 2024, 08:30",
      status: "completed",
      fee: "₽250",
      hash: "-",
    },
    {
      id: "TX006",
      type: "buy",
      crypto: "ADA",
      amount: "1,000",
      price: "₽36,500",
      total: "₽36,500",
      date: "10 дек 2024, 13:15",
      status: "failed",
      fee: "₽0",
      hash: "0x4567...8901",
    },
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case "sell":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      case "deposit":
        return <Wallet className="w-4 h-4 text-blue-600" />
      case "withdraw":
        return <Wallet className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-100"
      case "sell":
        return "bg-red-100"
      case "deposit":
        return "bg-blue-100"
      case "withdraw":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  const getTransactionText = (type: string) => {
    switch (type) {
      case "buy":
        return "Покупка"
      case "sell":
        return "Продажа"
      case "deposit":
        return "Пополнение"
      case "withdraw":
        return "Вывод"
      default:
        return "Операция"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Завершено
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />В обработке
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Отклонено
          </Badge>
        )
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.crypto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || tx.type === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">История операций</h1>
              <p className="text-gray-600 mt-1">Полная история ваших торговых операций и транзакций</p>
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Поиск по ID транзакции или криптовалюте..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Все операции</option>
                  <option value="buy">Покупки</option>
                  <option value="sell">Продажи</option>
                  <option value="deposit">Пополнения</option>
                  <option value="withdraw">Выводы</option>
                </select>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Период
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Все ({transactions.length})</TabsTrigger>
            <TabsTrigger value="buy">Покупки ({transactions.filter((t) => t.type === "buy").length})</TabsTrigger>
            <TabsTrigger value="sell">Продажи ({transactions.filter((t) => t.type === "sell").length})</TabsTrigger>
            <TabsTrigger value="deposit">
              Пополнения ({transactions.filter((t) => t.type === "deposit").length})
            </TabsTrigger>
            <TabsTrigger value="withdraw">
              Выводы ({transactions.filter((t) => t.type === "withdraw").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Все операции</CardTitle>
                <CardDescription>Полная история ваших транзакций</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 ${getTransactionColor(tx.type)} rounded-full flex items-center justify-center`}
                        >
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">
                              {getTransactionText(tx.type)} {tx.crypto}
                            </h3>
                            {getStatusBadge(tx.status)}
                          </div>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                          <p className="text-xs text-gray-400">ID: {tx.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {tx.type === "deposit" || tx.type === "buy" ? "+" : "-"}
                          {tx.amount} {tx.crypto}
                        </div>
                        <div className="text-sm text-gray-500">{tx.total}</div>
                        <div className="text-xs text-gray-400">Комиссия: {tx.fee}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would filter by type */}
          <TabsContent value="buy">
            <Card>
              <CardHeader>
                <CardTitle>Покупки</CardTitle>
                <CardDescription>История покупок криптовалют</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions
                    .filter((tx) => tx.type === "buy")
                    .map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Покупка {tx.crypto}</h3>
                            <p className="text-sm text-gray-500">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            +{tx.amount} {tx.crypto}
                          </div>
                          <div className="text-sm text-gray-500">{tx.total}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
