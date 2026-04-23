"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowDownRight, CreditCard, Wallet, Shield, Zap, Info, CheckCircle } from "lucide-react"

export default function SellPage() {
  const [amount, setAmount] = useState("")
  const [crypto, setCrypto] = useState("BTC")
  const [withdrawMethod, setWithdrawMethod] = useState("card")

  const cryptos = [
    { symbol: "BTC", name: "Bitcoin", price: "₽3,250,000", balance: "0.15432", icon: "₿", color: "text-orange-600" },
    { symbol: "ETH", name: "Ethereum", price: "₽201,500", balance: "2.8934", icon: "Ξ", color: "text-blue-600" },
    { symbol: "SOL", name: "Solana", price: "₽7,425", balance: "45.67", icon: "◎", color: "text-purple-600" },
    { symbol: "ADA", name: "Cardano", price: "₽36.50", balance: "1,250", icon: "₳", color: "text-green-600" },
  ]

  const withdrawMethods = [
    { id: "card", name: "Банковская карта", fee: "1%", time: "1-3 дня", icon: CreditCard },
    { id: "bank", name: "Банковский перевод", fee: "0.5%", time: "1-5 дней", icon: Wallet },
    { id: "sbp", name: "СБП", fee: "0%", time: "Мгновенно", icon: Zap },
  ]

  const selectedCrypto = cryptos.find((c) => c.symbol === crypto)
  const selectedMethod = withdrawMethods.find((m) => m.id === withdrawMethod)

  const calculateTotal = () => {
    if (!amount || !selectedCrypto) return "0"
    const price = Number.parseFloat(selectedCrypto.price.replace(/[₽,]/g, ""))
    const feePercent = Number.parseFloat(selectedMethod?.fee.replace("%", "") || "0") / 100
    const total = Number.parseFloat(amount) * price
    const fee = total * feePercent
    return (total - fee).toLocaleString("ru-RU")
  }

  const calculateFee = () => {
    if (!amount || !selectedCrypto) return "0"
    const price = Number.parseFloat(selectedCrypto.price.replace(/[₽,]/g, ""))
    const feePercent = Number.parseFloat(selectedMethod?.fee.replace("%", "") || "0") / 100
    const total = Number.parseFloat(amount) * price
    const fee = total * feePercent
    return fee.toLocaleString("ru-RU")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Продать криптовалюту</h1>
              <p className="text-gray-600 mt-1">Быстрая продажа ваших цифровых активов</p>
            </div>
            <Badge className="bg-red-50 text-red-700 border-red-200">
              <Shield className="w-3 h-3 mr-1" />
              Безопасная продажа
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Детали продажи</CardTitle>
                <CardDescription>Выберите криптовалюту и сумму для продажи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Crypto Selection */}
                <div className="space-y-3">
                  <Label>Выберите криптовалюту</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {cryptos.map((c) => (
                      <button
                        key={c.symbol}
                        onClick={() => setCrypto(c.symbol)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          crypto === c.symbol ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-2xl ${c.color}`}>{c.icon}</span>
                          <div>
                            <h3 className="font-semibold">{c.name}</h3>
                            <p className="text-sm text-gray-500">{c.price}</p>
                            <p className="text-xs text-gray-400">
                              Баланс: {c.balance} {c.symbol}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-3">
                  <Label htmlFor="amount">Количество {crypto}</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg"
                      max={selectedCrypto?.balance}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500 font-medium">{crypto}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      Доступно: {selectedCrypto?.balance} {crypto}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-blue-600"
                      onClick={() => setAmount(selectedCrypto?.balance || "")}
                    >
                      Продать все
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    {["25%", "50%", "75%", "100%"].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const balance = Number.parseFloat(selectedCrypto?.balance || "0")
                          const percent = Number.parseFloat(preset.replace("%", "")) / 100
                          setAmount((balance * percent).toString())
                        }}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Withdraw Method */}
                <div className="space-y-3">
                  <Label>Способ получения</Label>
                  <div className="space-y-3">
                    {withdrawMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setWithdrawMethod(method.id)}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          withdrawMethod === method.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <method.icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <h4 className="font-medium">{method.name}</h4>
                              <p className="text-sm text-gray-500">
                                Комиссия: {method.fee} • {method.time}
                              </p>
                            </div>
                          </div>
                          {withdrawMethod === method.id && <CheckCircle className="w-5 h-5 text-green-600" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Сводка продажи</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Продаете</span>
                  <span className="font-medium">
                    {amount || "0"} {crypto}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Цена за {crypto}</span>
                  <span className="font-medium">{selectedCrypto?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Комиссия ({selectedMethod?.fee})</span>
                  <span className="font-medium text-red-600">₽{calculateFee()}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Получите</span>
                  <span className="font-bold text-green-600">₽{calculateTotal()}</span>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  Продать {crypto}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Portfolio Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ваш портфель</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cryptos.map((c) => (
                  <div key={c.symbol} className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`${c.color}`}>{c.icon}</span>
                      <span className="font-medium">{c.symbol}</span>
                    </div>
                    <span className="text-gray-600">{c.balance}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Безопасность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Защищенные транзакции</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Мгновенное исполнение</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Конкурентные курсы</span>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Нужна помощь?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm">Налоги</h4>
                      <p className="text-blue-700 text-xs mt-1">Не забудьте учесть налоговые обязательства</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Связаться с поддержкой
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
