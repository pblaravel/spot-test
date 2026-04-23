# Frontend Integration Guide

## Обзор

Frontend приложение интегрировано с backend сервисами **только через API Gateway**. Приложение построено на Next.js 15 с TypeScript и использует современные UI компоненты. Все API запросы проходят через единую точку входа - API Gateway, который обеспечивает аутентификацию, роутинг и проксирование запросов к соответствующим микросервисам.

## Архитектура

```
Frontend (Next.js) → API Gateway → Backend Services
     ↓
  - User Service
  - Wallet Service  
  - Trading Engine
  - Order Book Service
  - Notification Service
  - Analytics Service
  - Market Maker Service
```

## Настроенные API Endpoints

### Аутентификация (User Service)
- `POST /api/users/auth/login` - Вход в систему
- `POST /api/users/auth/register` - Регистрация
- `GET /api/users/profile` - Получить профиль
- `PUT /api/users/profile` - Обновить профиль

### Кошельки (Wallet Service)
- `GET /api/wallet/wallets` - Получить все кошельки
- `GET /api/wallet/wallets/:id` - Получить кошелек
- `POST /api/wallet/wallets` - Создать кошелек
- `GET /api/wallet/transactions` - Получить транзакции
- `POST /api/wallet/transactions` - Создать транзакцию

### Торговля (Trading Engine)
- `GET /api/trading/orders` - Получить ордера
- `POST /api/trading/orders` - Создать ордер
- `DELETE /api/trading/orders/:id` - Отменить ордер
- `GET /api/trading/orderbook/:symbol` - Получить стакан заявок
- `GET /api/trading/market-data` - Получить рыночные данные

### Аналитика (Analytics Service)
- `GET /api/analytics/portfolio` - Аналитика портфеля
- `GET /api/analytics/trading-history` - История торговли

### Уведомления (Notification Service)
- `GET /api/notifications` - Получить уведомления
- `PUT /api/notifications/:id/read` - Отметить как прочитанное
- `PUT /api/notifications/read-all` - Отметить все как прочитанные

### Market Maker (Market Maker Service)
- `GET /api/market-maker/status` - Статус маркет-мейкера
- `POST /api/market-maker/toggle` - Включить/выключить для символа

## Установка и запуск

### Локальная разработка

```bash
# Установка зависимостей
cd frontend
make install

# Запуск в режиме разработки
make dev
```

### Docker

```bash
# Сборка образа
make docker-build

# Запуск контейнера
make docker-run

# Остановка контейнера
make docker-stop
```

### Через docker-compose

```bash
# Запуск всех сервисов включая frontend
docker-compose up -d

# Остановка
docker-compose down
```

## Конфигурация

### Переменные окружения

```env
# API Gateway URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket URL для real-time данных
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Окружение
NODE_ENV=production
```

### Next.js конфигурация

Файл `next.config.mjs` настроен для:
- Standalone режима для Docker
- Rewrites для проксирования API запросов к API Gateway
- Оптимизации изображений

## API Клиент

### Основной клиент

API клиент настроен для работы **только через API Gateway**. Все запросы автоматически направляются на порт 3000 (API Gateway), который затем проксирует их к соответствующим микросервисам.

```typescript
import { apiClient } from '@/lib/api-client';

// Аутентификация (через API Gateway)
const loginResult = await apiClient.login(email, password);

// Получение данных (через API Gateway)
const wallets = await apiClient.getWallets();
const orders = await apiClient.getOrders();
```

### Хук аутентификации

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Использование
}
```

## Структура проекта

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Дашборд пользователя
│   ├── markets/           # Рыночные данные
│   ├── trading/           # Торговый интерфейс
│   └── ...
├── components/            # UI компоненты
│   ├── ui/               # Базовые компоненты
│   └── ...
├── hooks/                # React хуки
│   └── use-auth.ts       # Хук аутентификации
├── lib/                  # Утилиты
│   ├── api-client.ts     # API клиент
│   └── utils.ts          # Общие утилиты
└── ...
```

## Тестирование API

### Ручное тестирование

```bash
# Проверка API Gateway
curl http://localhost:3000/health

# Проверка User Service
curl http://localhost:3000/api/users/health

# Проверка Wallet Service
curl http://localhost:3000/api/wallet/health
```

## Разработка

### Добавление новых API

1. Добавьте методы в `lib/api-client.ts`
2. Создайте соответствующие типы
3. Используйте в компонентах

### Создание новых страниц

1. Создайте папку в `app/`
2. Добавьте `page.tsx`
3. Используйте API клиент для получения данных

### Стилизация

Проект использует:
- Tailwind CSS для стилей
- Radix UI для компонентов
- CSS Modules для кастомных стилей

## Мониторинг

### Логи

```bash
# Логи frontend контейнера
docker logs frontend

# Логи через docker-compose
docker-compose logs frontend
```

### Статус

```bash
# Статус контейнера
docker ps | grep frontend

# Проверка здоровья
curl http://localhost:3008/health
```

## Troubleshooting

### Проблемы с подключением к API

1. Проверьте, что API Gateway запущен
2. Убедитесь в правильности `NEXT_PUBLIC_API_URL`
3. Проверьте CORS настройки в API Gateway

### Проблемы с Docker

1. Очистите кэш: `make clean`
2. Пересоберите образ: `make docker-build`
3. Проверьте порты: `docker ps`

### Проблемы с зависимостями

1. Удалите node_modules: `rm -rf node_modules`
2. Переустановите: `make install`
3. Очистите кэш: `make clean`

## Производительность

### Оптимизации

- Next.js Image оптимизация
- Code splitting
- Lazy loading компонентов
- Кэширование API запросов

### Мониторинг

- Bundle analyzer: `npm run analyze`
- Lighthouse аудит
- Core Web Vitals

## Безопасность

### Архитектура безопасности

- **Единая точка входа**: Все запросы проходят через API Gateway
- **Изоляция сервисов**: Backend сервисы недоступны напрямую извне
- **Централизованная аутентификация**: JWT токены проверяются в API Gateway
- **CORS защита**: Настроена только для API Gateway

### Аутентификация

- JWT токены
- Автоматическое обновление токенов
- Защищенные роуты
- Централизованная проверка в API Gateway

### Валидация

- TypeScript типы
- Zod схемы для валидации
- Санитизация входных данных
- Валидация на уровне API Gateway

## Деплой

### Подготовка к деплою

```bash
# Подготовка всех сервисов
make prepare-all

# Сборка Docker образов
make docker-build-all
```

### Продакшн настройки

- Настройте переменные окружения
- Включите HTTPS
- Настройте мониторинг
- Настройте логирование 