import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, Users, Award, Clock, ArrowRight } from "lucide-react"

export default function LearnPage() {
  const courses = [
    {
      title: "Основы криптовалют",
      description: "Изучите базовые понятия блокчейна и криптовалют",
      duration: "2 часа",
      level: "Начинающий",
      students: "12,450",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Технический анализ",
      description: "Научитесь читать графики и прогнозировать движения цен",
      duration: "4 часа",
      level: "Средний",
      students: "8,230",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "DeFi и стейкинг",
      description: "Погрузитесь в мир децентрализованных финансов",
      duration: "3 часа",
      level: "Продвинутый",
      students: "5,670",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Управление рисками",
      description: "Изучите стратегии защиты ваших инвестиций",
      duration: "2.5 часа",
      level: "Средний",
      students: "9,120",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const articles = [
    {
      title: "Что такое Bitcoin и как он работает?",
      category: "Основы",
      readTime: "5 мин",
      date: "15 дек 2024",
    },
    {
      title: "Как безопасно хранить криптовалюты",
      category: "Безопасность",
      readTime: "8 мин",
      date: "12 дек 2024",
    },
    {
      title: "Топ-10 ошибок начинающих трейдеров",
      category: "Торговля",
      readTime: "12 мин",
      date: "10 дек 2024",
    },
    {
      title: "Налогообложение криптовалют в России",
      category: "Право",
      readTime: "15 мин",
      date: "8 дек 2024",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Обучение криптовалютам</h1>
            <p className="text-xl text-gray-600 mb-8">
              Изучайте основы блокчейна, торговли и инвестирования в криптовалюты с нашими экспертными курсами
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                <Play className="w-4 h-4 mr-2" />
                Начать обучение
              </Button>
              <Button size="lg" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Библиотека статей
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
              <div className="text-gray-600">Курсов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">25,000+</div>
              <div className="text-gray-600">Студентов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">15,000+</div>
              <div className="text-gray-600">Сертификатов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">200+</div>
              <div className="text-gray-600">Часов контента</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Courses */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Популярные курсы</h2>
            <Button variant="outline">
              Все курсы
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{course.level}</Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-3 h-3 mr-1" />
                      {course.students} студентов
                    </div>
                    <Button size="sm">Начать</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Learning Paths */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Траектории обучения</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Новичок</h3>
              <p className="text-gray-600 mb-4">
                Начните с основ криптовалют и блокчейна. Изучите, как безопасно покупать и хранить цифровые активы.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Что такое блокчейн</li>
                <li>• Основы Bitcoin и Ethereum</li>
                <li>• Безопасность кошельков</li>
                <li>• Первая покупка криптовалюты</li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent">
                Начать путь
              </Button>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Трейдер</h3>
              <p className="text-gray-600 mb-4">
                Освойте технический анализ и стратегии торговли. Научитесь управлять рисками и читать рынок.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Технический анализ</li>
                <li>• Торговые стратегии</li>
                <li>• Управление рисками</li>
                <li>• Психология торговли</li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent">
                Начать путь
              </Button>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">DeFi эксперт</h3>
              <p className="text-gray-600 mb-4">
                Погрузитесь в мир децентрализованных финансов. Изучите стейкинг, фарминг и сложные DeFi протоколы.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• DeFi протоколы</li>
                <li>• Yield farming</li>
                <li>• Ликвидность и AMM</li>
                <li>• Смарт-контракты</li>
              </ul>
              <Button variant="outline" className="w-full bg-transparent">
                Начать путь
              </Button>
            </Card>
          </div>
        </section>

        {/* Recent Articles */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Последние статьи</h2>
            <Button variant="outline">
              Все статьи
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{article.category}</Badge>
                    <span className="text-sm text-gray-500">{article.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{article.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime} чтения
                    </div>
                    <Button variant="ghost" size="sm">
                      Читать
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
