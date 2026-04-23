import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Wallet, BarChart3, Lock, Smartphone, DollarSign, Bitcoin, Activity } from "lucide-react"

export default function CryptoSpotMinimal() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-50 text-green-700 border-green-200 px-4 py-2">
              ✨ Новая платформа для торговли криптовалютами
            </Badge>
            <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              Торгуйте
              <br />
              <span className="text-gray-400">криптовалютой</span>
              <br />
              просто
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Современная платформа для покупки, продажи и обмена криптовалют. Безопасно, быстро и с минимальными
              комиссиями.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg">
                Начать торговлю
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg bg-transparent"
              >
                Посмотреть рынки
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">₽2.1T</div>
              <div className="text-gray-500">Объем торгов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-500">Пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-gray-500">Криптовалют</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">0.1%</div>
              <div className="text-gray-500">Комиссия</div>
            </div>
          </div>
        </div>
      </section>

      {/* Crypto Prices */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Популярные криптовалюты</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700 bg-transparent">
              Все рынки
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {[
              { name: "Bitcoin", symbol: "BTC", price: "₽3,250,000", change: "+2.45%", positive: true, icon: "₿" },
              { name: "Ethereum", symbol: "ETH", price: "₽201,500", change: "+1.82%", positive: true, icon: "Ξ" },
              { name: "Solana", symbol: "SOL", price: "₽7,425", change: "+5.23%", positive: true, icon: "◎" },
              { name: "Cardano", symbol: "ADA", price: "₽36.50", change: "-0.95%", positive: false, icon: "₳" },
            ].map((crypto, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-700">{crypto.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{crypto.name}</h3>
                        <p className="text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{crypto.price}</div>
                      <div className={`text-sm font-medium ${crypto.positive ? "text-green-600" : "text-red-600"}`}>
                        {crypto.change}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Почему выбирают нас</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Мы создали платформу, которая делает торговлю криптовалютами простой и безопасной
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Безопасность</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Ваши средства защищены банковским уровнем безопасности и холодным хранением
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Быстрые сделки</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Мгновенное исполнение ордеров благодаря высокопроизводительному движку
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Аналитика</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Профессиональные графики и инструменты для технического анализа
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Smartphone className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Мобильное приложение</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Торгуйте в любом месте с помощью нашего мобильного приложения
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Низкие комиссии</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Конкурентные тарифы от 0.1% за сделку
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-sm p-2">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Wallet className="w-7 h-7 text-gray-700" />
                </div>
                <CardTitle className="text-xl text-gray-900">Простота</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Интуитивный интерфейс, подходящий как новичкам, так и профессионалам
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Начните торговать уже сегодня</h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам трейдеров, которые уже выбрали CryptoSpot для своих инвестиций в криптовалюты
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg">
            Создать аккаунт бесплатно
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">CryptoSpot</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Современная платформа для торговли криптовалютами с фокусом на безопасность и простоту использования.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Продукты</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Спот торговля
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Фьючерсы
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Стейкинг
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    P2P торговля
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Поддержка</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Центр помощи
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Связаться с нами
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    API документация
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Статус системы
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Компания</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    О нас
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Карьера
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Пресс-центр
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Правовая информация
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500">
            <p>&copy; 2024 CryptoSpot. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
