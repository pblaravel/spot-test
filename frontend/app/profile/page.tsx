"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Key,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Camera,
  Download,
  Trash2,
} from "lucide-react"
import { useAuth } from '@/hooks/use-auth'

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    trading: true,
    news: false,
  })

  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const handleSaveProfile = async () => {
    setSaveLoading(true)
    setError('')
    setSuccess('')
    const result = await updateProfile(profileData)
    if (result.success) {
      setSuccess('Профиль успешно обновлен')
    } else {
      setError(result.error || 'Ошибка обновления профиля')
    }
    setSaveLoading(false)
  }

  const verificationStatus = {
    email: true,
    phone: true,
    identity: false,
    address: false,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
              <p className="text-gray-600">Управление личными данными и настройками</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saveLoading} className="bg-black text-white hover:bg-gray-800">
              {saveLoading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Личные данные</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="verification">Верификация</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="preferences">Настройки</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                  <CardDescription>Обновите свои личные данные</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="flex-1"
                      />
                      <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Подтвержден
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Фото профиля</CardTitle>
                  <CardDescription>Загрузите свое фото</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Загрузить фото
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      JPG, PNG до 5MB
                      <br />
                      Рекомендуемый размер: 400x400px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Смена пароля</CardTitle>
                  <CardDescription>Обновите свой пароль для безопасности</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button className="w-full">Изменить пароль</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Двухфакторная аутентификация</CardTitle>
                  <CardDescription>Дополнительная защита вашего аккаунта</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Аутентификатор</p>
                        <p className="text-sm text-gray-500">Google Authenticator, Authy</p>
                      </div>
                    </div>
                    <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
                  </div>

                  {!twoFAEnabled && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>Включите 2FA для дополнительной безопасности вашего аккаунта</AlertDescription>
                    </Alert>
                  )}

                  <Button variant="outline" className="w-full bg-transparent">
                    <Key className="w-4 h-4 mr-2" />
                    {twoFAEnabled ? "Настроить 2FA" : "Включить 2FA"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Активные сессии</CardTitle>
                  <CardDescription>Управление устройствами с доступом к аккаунту</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Текущая сессия</p>
                        <p className="text-sm text-gray-500">Chrome на Windows • Москва, Россия</p>
                        <p className="text-xs text-gray-400">Сейчас активна</p>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">Активна</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Мобильное приложение</p>
                        <p className="text-sm text-gray-500">iPhone • Москва, Россия</p>
                        <p className="text-xs text-gray-400">2 часа назад</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Завершить
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Завершить все сессии
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API ключи</CardTitle>
                  <CardDescription>Управление API ключами для торговли</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      API ключи предоставляют доступ к вашему аккаунту. Храните их в безопасности.
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Key className="w-4 h-4 mr-2" />
                    Создать API ключ
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статус верификации</CardTitle>
                <CardDescription>Подтвердите свою личность для полного доступа к функциям</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-500">Подтверждение email адреса</p>
                      </div>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Подтвержден
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Телефон</p>
                        <p className="text-sm text-gray-500">Подтверждение номера телефона</p>
                      </div>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Подтвержден
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Личность</p>
                        <p className="text-sm text-gray-500">Загрузка документов</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Требуется
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Адрес</p>
                        <p className="text-sm text-gray-500">Подтверждение адреса</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Ожидает
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Полная верификация увеличивает лимиты на операции и обеспечивает дополнительную безопасность
                  </AlertDescription>
                </Alert>

                <Button className="w-full bg-black text-white hover:bg-gray-800">Пройти верификацию</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>Выберите, как вы хотите получать уведомления</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email уведомления</p>
                      <p className="text-sm text-gray-500">Получать уведомления на email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS уведомления</p>
                      <p className="text-sm text-gray-500">Получать SMS на телефон</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push уведомления</p>
                      <p className="text-sm text-gray-500">Уведомления в браузере</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                </div>

                <hr />

                <div className="space-y-4">
                  <h3 className="font-medium">Типы уведомлений</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Торговые операции</p>
                      <p className="text-sm text-gray-500">Уведомления о сделках и ордерах</p>
                    </div>
                    <Switch
                      checked={notifications.trading}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, trading: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Новости и обновления</p>
                      <p className="text-sm text-gray-500">Новости о продуктах и рынке</p>
                    </div>
                    <Switch
                      checked={notifications.news}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, news: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Общие настройки</CardTitle>
                  <CardDescription>Персонализация интерфейса</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Язык интерфейса</Label>
                    <select id="language" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Основная валюта</Label>
                    <select id="currency" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="rub">RUB (₽)</option>
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Часовой пояс</Label>
                    <select id="timezone" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="europe/moscow">Москва (UTC+3)</option>
                      <option value="europe/london">Лондон (UTC+0)</option>
                      <option value="america/new_york">Нью-Йорк (UTC-5)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Торговые настройки</CardTitle>
                  <CardDescription>Настройки для торговли</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Подтверждение сделок</p>
                      <p className="text-sm text-gray-500">Запрашивать подтверждение перед сделкой</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Звуковые уведомления</p>
                      <p className="text-sm text-gray-500">Звук при выполнении ордеров</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultOrderType">Тип ордера по умолчанию</Label>
                    <select id="defaultOrderType" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="market">Рыночный</option>
                      <option value="limit">Лимитный</option>
                      <option value="stop">Стоп-лосс</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Экспорт данных</CardTitle>
                  <CardDescription>Скачайте свои данные</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт истории операций
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт налогового отчета
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Экспорт всех данных
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Удаление аккаунта</CardTitle>
                  <CardDescription>Безвозвратное удаление аккаунта</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Удаление аккаунта необратимо. Все данные будут потеряны навсегда.
                    </AlertDescription>
                  </Alert>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить аккаунт
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
