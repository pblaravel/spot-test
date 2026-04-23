"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Wallet,
  Smartphone,
  QrCode,
  Copy,
  CheckCircle,
  Clock,
  Shield,
  Info,
  ArrowUpRight,
} from "lucide-react"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("card")
  const [copied, setCopied] = useState(false)

  const fiatMethods = [
    {
      id: "card",
      name: "Банковская карта",
      fee: "0%",
      time: "Мгновенно",
      min: "₽100",
      max: "₽500,000",
      icon: CreditCard,
    },
    {
      id: "bank",
      name: "Банковский перевод",
      fee: "0%",
      time: "1-3 дня",
      min: "₽1,000",
      max: "₽5,000,000",
      icon: Wallet,
    },
    {
      id: "sbp",
      name: "СБП",
      fee: "0%",
      time: "Мгновенно",
      min: "₽10",
      max: "₽1,000,000",
      icon: Smartphone,
    },
  ]

  const cryptoAddresses = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      network: "Bitcoin",
      icon: "₿",
      color: "text-orange-600",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      network: "Ethereum (ERC-20)",
      icon: "Ξ",
      color: "text-blue-600",
    },
    {
      symbol: "USDT",
      name: "Tether",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      network: "Ethereum (ERC-20)",
      icon: "₮",
      color: "text-green-600",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Пополнить баланс</h1>
              <p className="text-gray-600 mt-1">Добавьте средства на ваш аккаунт</p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Безопасное пополнение
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="fiat" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fiat">Рубли (RUB)</TabsTrigger>
                <TabsTrigger value="crypto">Криптовалюта</TabsTrigger>
              </TabsList>

              {/* Fiat Deposit */}
              <TabsContent value="fiat" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Пополнение рублями</CardTitle>
                    <CardDescription>Выберите удобный способ пополнения</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <Label>Способ пополнения</Label>
                      <div className="space-y-3">
                        {fiatMethods.map((paymentMethod) => (
                          <button
                            key={paymentMethod.id}
                            onClick={() => setMethod(paymentMethod.id)}
                            className={`w-full p-4 border rounded-lg text-left transition-colors ${
                              method === paymentMethod.id
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <paymentMethod.icon className="w-5 h-5 text-gray-600" />
                                <div>
                                  <h4 className="font-medium">{paymentMethod.name}</h4>
                                  <p className="text-sm text-gray-500">
                                    {paymentMethod.min} - {paymentMethod.max} • {paymentMethod.time}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">{paymentMethod.fee}</div>
                                {method === paymentMethod.id && <CheckCircle className="w-5 h-5 text-green-600 mt-1" />}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3">
                      <Label htmlFor="amount">Сумма пополнения</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="1000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="text-lg pr-12"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-gray-500 font-medium">₽</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {["1000", "5000", "10000", "50000"].map((preset) => (
                          <Button key={preset} variant="outline" size="sm" onClick={() => setAmount(preset)}>
                            ₽{Number(preset).toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Пополнить на ₽{amount || "0"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Crypto Deposit */}
              <TabsContent value="crypto" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Пополнение криптовалютой</CardTitle>
                    <CardDescription>Переведите криптовалюту на указанные адреса</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cryptoAddresses.map((crypto) => (
                      <div key={crypto.symbol} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`text-2xl ${crypto.color}`}>{crypto.icon}</span>
                          <div>
                            <h3 className="font-semibold">
                              {crypto.name} ({crypto.symbol})
                            </h3>
                            <p className="text-sm text-gray-500">{crypto.network}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Адрес для пополнения</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input value={crypto.address} readOnly className="font-mono text-sm" />
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(crypto.address)}>
                                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <QrCode className="w-24 h-24 text-gray-400" />
                          </div>

                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900 text-sm">Важно!</h4>
                                <p className="text-yellow-700 text-xs mt-1">
                                  Отправляйте только {crypto.symbol} в сети {crypto.network}. Другие активы будут
                                  потеряны.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Текущий баланс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">₽125,430</div>
                  <div className="text-sm text-gray-500">Доступно для торговли</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">В ордерах</span>
                    <span>₽15,670</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Заморожено</span>
                    <span>₽0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deposits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Последние пополнения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">₽50,000</div>
                    <div className="text-sm text-gray-500">Банковская карта</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Завершено
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">12 дек</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">0.01 BTC</div>
                    <div className="text-sm text-gray-500">Bitcoin</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="w-3 h-3 mr-1" />
                      Ожидание
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">10 дек</div>
                  </div>
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
                      <h4 className="font-medium text-blue-900 text-sm">Время зачисления</h4>
                      <p className="text-blue-700 text-xs mt-1">Средства поступят в течение указанного времени</p>
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
