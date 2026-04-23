import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Globe, Award, Target, Heart, Linkedin, Twitter } from "lucide-react"

export default function AboutPage() {
  const team = [
    {
      name: "Алексей Петров",
      role: "CEO & Основатель",
      description: "15+ лет в финтехе, бывший руководитель в Сбербанке",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Мария Сидорова",
      role: "CTO",
      description: "Эксперт по блокчейну, PhD в области криптографии",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Дмитрий Козлов",
      role: "Head of Trading",
      description: "Бывший трейдер Goldman Sachs, 12 лет на финансовых рынках",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      name: "Анна Волкова",
      role: "Head of Security",
      description: "Специалист по кибербезопасности, сертификация CISSP",
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Безопасность",
      description: "Защита средств клиентов - наш главный приоритет. Мы используем банковские стандарты безопасности.",
    },
    {
      icon: Users,
      title: "Клиентоориентированность",
      description: "Мы создаем продукты, которые действительно нужны нашим пользователям, основываясь на их отзывах.",
    },
    {
      icon: Globe,
      title: "Инновации",
      description: "Мы постоянно внедряем новые технологии, чтобы сделать торговлю криптовалютами проще и доступнее.",
    },
    {
      icon: Heart,
      title: "Прозрачность",
      description: "Честность и открытость во всех наших операциях. Никаких скрытых комиссий или условий.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-gray-100 text-gray-700 border-gray-200">О компании CryptoSpot</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Мы делаем криптовалюты
            <br />
            доступными для всех
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            CryptoSpot была основана в 2020 году с миссией демократизации доступа к криптовалютам. Сегодня мы
            обслуживаем более миллиона пользователей по всему миру.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Присоединиться к команде
            </Button>
            <Button size="lg" variant="outline">
              Наша история
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">1M+</div>
              <div className="text-gray-600">Активных пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">₽50B+</div>
              <div className="text-gray-600">Объем торгов</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-gray-600">Криптовалют</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-600">Время работы</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-gray-700" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наша миссия</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Мы стремимся сделать криптовалюты доступными и понятными для каждого человека, независимо от его
                технических знаний или финансового опыта.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Наша платформа объединяет простоту использования с профессиональными инструментами, позволяя как
                новичкам, так и опытным трейдерам достигать своих финансовых целей.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-gray-700" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наше видение</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Мы видим будущее, где криптовалюты станут неотъемлемой частью глобальной финансовой системы, обеспечивая
                равные возможности для всех.
              </p>
              <p className="text-gray-600 leading-relaxed">
                CryptoSpot стремится стать ведущей платформой, которая не только предоставляет торговые услуги, но и
                образовывает пользователей, помогая им принимать осознанные решения.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши ценности</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Принципы, которые направляют нашу работу и определяют наше отношение к клиентам
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наша команда</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Опытные профессионалы из финтеха, блокчейна и традиционных финансов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-4">{member.description}</p>
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Twitter className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Готовы присоединиться к революции?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Станьте частью сообщества CryptoSpot и начните свой путь в мире криптовалют уже сегодня
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100">
              Создать аккаунт
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black bg-transparent"
            >
              Связаться с нами
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
