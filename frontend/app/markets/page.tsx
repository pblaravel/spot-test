import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"

export default function MarketsPage() {
  const cryptos = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      price: "₽3,250,000",
      change: "+2.45%",
      volume: "₽2.1B",
      cap: "₽64.2T",
      positive: true,
      icon: "₿",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      price: "₽201,500",
      change: "+1.82%",
      volume: "₽1.8B",
      cap: "₽24.2T",
      positive: true,
      icon: "Ξ",
    },
    {
      name: "Solana",
      symbol: "SOL",
      price: "₽7,425",
      change: "+5.23%",
      volume: "₽890M",
      cap: "₽3.2T",
      positive: true,
      icon: "◎",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      price: "₽36.50",
      change: "-0.95%",
      volume: "₽420M",
      cap: "₽1.3T",
      positive: false,
      icon: "₳",
    },
    {
      name: "Polygon",
      symbol: "MATIC",
      price: "₽69.20",
      change: "+3.17%",
      volume: "₽380M",
      cap: "₽640B",
      positive: true,
      icon: "⬟",
    },
    {
      name: "Chainlink",
      symbol: "LINK",
      price: "₽1,115",
      change: "-1.24%",
      volume: "₽290M",
      cap: "₽660B",
      positive: false,
      icon: "⬢",
    },
    {
      name: "Polkadot",
      symbol: "DOT",
      price: "₽520",
      change: "+0.87%",
      volume: "₽180M",
      cap: "₽680B",
      positive: true,
      icon: "●",
    },
    {
      name: "Avalanche",
      symbol: "AVAX",
      price: "₽2,680",
      change: "+4.12%",
      volume: "₽340M",
      cap: "₽1.1T",
      positive: true,
      icon: "▲",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Рынки криптовалют</h1>
              <p className="text-gray-600">Отслеживайте цены и торгуйте более чем 150 криптовалютами</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Поиск криптовалют..." className="pl-10 w-64" />
              </div>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Избранное
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Общая капитализация</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₽98.5T</div>
              <div className="text-sm text-green-600">+2.1% за 24ч</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">24ч Объем торгов</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">₽8.2T</div>
              <div className="text-sm text-green-600">+5.8% за 24ч</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Доминация BTC</span>
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">52.3%</div>
              <div className="text-sm text-red-600">-0.4% за 24ч</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Активные монеты</span>
                <span className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">2,847</div>
              <div className="text-sm text-gray-500">Всего монет</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="default" className="bg-black text-white">
            Все
          </Button>
          <Button variant="outline">Топ-100</Button>
          <Button variant="outline">DeFi</Button>
          <Button variant="outline">NFT</Button>
          <Button variant="outline">Метавселенная</Button>
          <Button variant="outline">Новые листинги</Button>
        </div>

        {/* Crypto Table */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 border-b bg-gray-50 text-sm font-medium text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Название</div>
              <div className="col-span-2">Цена</div>
              <div className="col-span-2">24ч %</div>
              <div className="col-span-2">Объем (24ч)</div>
              <div className="col-span-2">Рын. кап.</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {cryptos.map((crypto, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="col-span-1 flex items-center">
                    <span className="text-gray-500 font-medium">{index + 1}</span>
                  </div>
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">{crypto.icon}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{crypto.name}</div>
                      <div className="text-sm text-gray-500">{crypto.symbol}</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="font-semibold text-gray-900">{crypto.price}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge className={`${crypto.positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {crypto.change}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-gray-600">{crypto.volume}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-gray-600">{crypto.cap}</span>
                    <Button variant="ghost" size="sm">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Загрузить еще
          </Button>
        </div>
      </div>
    </div>
  )
}
