"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, CreditCard, Wallet, Shield, Zap, Info, CheckCircle } from "lucide-react"

export default function BuyPage() {
  const [amount, setAmount] = useState("")
  const [crypto, setCrypto] = useState("BTC")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const cryptos = [
    { symbol: "BTC", name: "Bitcoin", price: "₽3,250,000", icon: "₿", color: "text-orange-600" },
    { symbol: "ETH", name: "Ethereum", price: "₽201,500", icon: "Ξ", color: "text-blue-600" },
    { symbol: "SOL", name: "Solana", price: "₽7,425", icon: "◎", color: "text-purple-600" },
    { symbol: "ADA", name: "Cardano", price: "₽36.50", icon: "₳", color: "text-green-600" },
  ]

  const paymentMethods = [
    { id: "card", name: "Банковская карта", fee: "0%", time: "Мгновенно", icon: CreditCard },
    { id: "bank", name: "Банковский перевод", fee: "0%", time: "1-3 дня", icon: Wallet },
    { id: "sbp", name: "СБП", fee: "0%", time: "Мгновенно", icon: Zap },
  ]

  const selectedCrypto = cryptos.find((c) => c.symbol === crypto)
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethod)

  const calculateTotal = () => {
    if (!amount || !selectedCrypto) return "0"
    const price = Number.parseFloat(selectedCrypto.price.replace(/[₽,]/g, ""))
    const total = Number.parseFloat(amount) * price
    return total.toLocaleString("ru-RU")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Купить криптовалюту</h1>
              <p className="text-gray-600 mt-1">Быстрая и безопасная покупка цифровых активов</p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Безопасная покупка
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
                <CardTitle>Детали покупки</CardTitle>
                <CardDescription>Выберите криптовалюту и сумму для покупки</CardDescription>
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
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500 font-medium">{crypto}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {["0.001", "0.01", "0.1", "1"].map((preset) => (
                      <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(preset)}>
                        {preset} {crypto}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Способ оплаты</Label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          paymentMethod === method.id
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
                          {paymentMethod === method.id && <CheckCircle className="w-5 h-5 text-green-600" />}
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
                <CardTitle>Сводка заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Покупаете</span>
                  <span className="font-medium">
                    {amount || "0"} {crypto}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Цена за {crypto}</span>
                  <span className="font-medium">{selectedCrypto?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Комиссия</span>
                  <span className="font-medium text-green-600">₽0 (0%)</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Итого к оплате</span>
                  <span className="font-bold">₽{calculateTotal()}</span>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Купить {crypto}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Информация о рынке</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">24ч изменение</span>
                  <span className="text-green-600 font-medium">+2.45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">24ч объем</span>
                  <span className="font-medium">₽2.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Рын. капитализация</span>
                  <span className="font-medium">₽64.2T</span>
                </div>
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
                  <span className="text-sm">SSL шифрование</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Холодное хранение</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Страхование активов</span>
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
                      <h4 className="font-medium text-blue-900 text-sm">Первая покупка?</h4>
                      <p className="text-blue-700 text-xs mt-1">Ознакомьтесь с нашим руководством</p>
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
