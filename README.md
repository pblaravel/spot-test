# 🚀 Высоконагруженная криптобиржа - Микросервисная архитектура

Современная криптобиржа с микросервисной архитектурой, построенная для высокой производительности, масштабируемости и надежности.

## 🏗️ Архитектура

### Микросервисы

| Сервис | Технология | Порт | Описание |
|--------|------------|------|----------|
| **Frontend** | Next.js | 3008 | Веб-интерфейс для пользователей |
| **API Gateway** | NestJS | 3000 | Единая точка входа, роутинг, аутентификация |
| **User Service** | NestJS | 3001 | Управление пользователями, аутентификация |
| **Wallet Service** | NestJS | 3002 | Управление кошельками, балансами, транзакциями |
| **Trading Engine** | Go | 8080 | Обработка ордеров, матчинг |
| **Order Book Service** | Go | 8081 | Управление стаканом заявок |
| **Notification Service** | NestJS | 3005 | Уведомления, email, push |
| **Analytics Service** | NestJS | 3006 | Аналитика, отчеты, метрики |
| **Market Maker Service** | NestJS | 3007 | Создание ликвидности |

### Инфраструктура

| Компонент | Порт | Описание |
|-----------|------|----------|
| **PostgreSQL** | 5432 | Основная база данных |
| **Redis** | 6379 | Кэширование, сессии |
| **InfluxDB** | 8086 | Временные ряды, метрики |
| **Kafka** | 9092 | Событийная шина |
| **Zookeeper** | 2181 | Координация Kafka |
| **Prometheus** | 9090 | Мониторинг метрик |
| **Grafana** | 3006 | Визуализация метрик |

## 🚀 Быстрый старт

### Предварительные требования

- Docker & Docker Compose
- Node.js 18+ (для локальной разработки)
- Go 1.21+ (для локальной разработки)

### Запуск

```bash
# Клонирование репозитория
git clone <repository-url>
cd spot

# Запуск всех сервисов
./start.sh

# Или через Docker Compose
docker-compose up -d
```

### Проверка работоспособности

```bash
# Тестирование API Gateway и User Service
./test-api.sh

# Тестирование Wallet Service
./test-wallet-api.sh

# Проверка здоровья сервисов
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:8080/health
curl http://localhost:8081/health

# Доступ к веб-интерфейсу
open http://localhost:3008
```

## 🌐 Frontend

### Веб-интерфейс

Frontend приложение построено на Next.js 15 с TypeScript и предоставляет современный пользовательский интерфейс для:

- **Аутентификация**: регистрация, вход, управление профилем
- **Торговля**: создание ордеров, просмотр стакана заявок, история торговли
- **Кошельки**: управление балансами, история транзакций
- **Аналитика**: портфель, графики, отчеты
- **Уведомления**: системные уведомления и алерты

### Технологии

- **Next.js 15** - React фреймворк
- **TypeScript** - Типизированный JavaScript
- **Tailwind CSS** - Утилитарные стили
- **Radix UI** - Доступные компоненты
- **React Hook Form** - Управление формами
- **Recharts** - Графики и диаграммы

### Запуск

```bash
# Локальная разработка
cd frontend
make install
make dev

# Через Docker
make docker-build
make docker-run

# Доступ
open http://localhost:3008
```

### Тестирование API

Используйте curl или Postman для тестирования API через API Gateway.

## 📚 API Документация

- [Основная API документация](API_DOCUMENTATION.md)
- [Wallet API документация](WALLET_API_DOCUMENTATION.md)
- [Frontend Integration Guide](FRONTEND_INTEGRATION.md)

## 💰 Wallet Service

### Основные возможности

- **Управление кошельками**: создание, получение, статусы
- **Операции с балансом**: пополнение, вывод, переводы
- **Блокировка средств**: для торговых операций
- **История транзакций**: полный аудит операций
- **Поддержка множественных валют**: BTC, ETH, USDT, USDC и др.

### Ключевые endpoints

```bash
# Создание кошелька
POST /api/v1/wallets

# Получение кошельков пользователя
GET /api/v1/wallets/user/{userId}

# Пополнение кошелька
POST /api/v1/wallets/user/{userId}/currency/{currency}/deposit

# Вывод средств
POST /api/v1/wallets/user/{userId}/currency/{currency}/withdraw

# Перевод между пользователями
POST /api/v1/wallets/transfer

# История транзакций
GET /api/v1/wallets/user/{userId}/transactions
```

### Примеры использования

```bash
# Создание BTC кошелька
curl -X POST http://localhost:3000/api/v1/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123", "currency": "BTC"}'

# Пополнение кошелька
curl -X POST http://localhost:3000/api/v1/wallets/user/user-123/currency/BTC/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 0.5, "txHash": "abc123", "description": "Deposit"}'

# Получение баланса
curl http://localhost:3000/api/v1/wallets/user/user-123/currency/BTC
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Базы данных
DATABASE_URL=postgresql://admin:password@postgres:5432/crypto_exchange
REDIS_URL=redis://redis:6379
INFLUXDB_URL=http://influxdb:8086

# Kafka
KAFKA_BROKERS=kafka:9092

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Сервисы
USER_SERVICE_URL=http://user-service:3001
WALLET_SERVICE_URL=http://wallet-service:3002
TRADING_ENGINE_URL=http://trading-engine:8080
ORDER_BOOK_SERVICE_URL=http://order-book-service:8081
```

### Настройка базы данных

```bash
# Инициализация базы данных
docker-compose exec postgres psql -U admin -d crypto_exchange -f /docker-entrypoint-initdb.d/init-db.sql
```

## 📊 Мониторинг

### Метрики и дашборды

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3006
- **Health Checks**: 
  - API Gateway: http://localhost:3000/health
  - User Service: http://localhost:3001/health
  - Wallet Service: http://localhost:3002/health

### Логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f api-gateway
docker-compose logs -f wallet-service
```

## 🧪 Тестирование

### Автоматические тесты

```bash
# Тестирование API Gateway и User Service
./test-api.sh

# Тестирование Wallet Service
./test-wallet-api.sh

# Ручное тестирование
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Нагрузочное тестирование

```bash
# Установка Apache Bench
sudo apt-get install apache2-utils

# Тест нагрузки на API Gateway
ab -n 1000 -c 10 http://localhost:3000/health
```

## 🔒 Безопасность

### Аутентификация и авторизация

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Rate limiting на API Gateway
- Валидация входных данных

### Безопасность кошельков

- Блокировка средств для торговых операций
- Аудит всех транзакций
- Поддержка подтверждений блокчейн транзакций
- Защита от двойных трат

## 📈 Производительность

### Оптимизации

- Кэширование в Redis
- Connection pooling для PostgreSQL
- Асинхронная обработка событий через Kafka
- Горизонтальное масштабирование микросервисов

### Метрики производительности

- Время отклика API: < 100ms
- Пропускная способность: > 10,000 RPS
- Доступность: 99.9%

## 🚀 Развертывание

### Продакшн

```bash
# Сборка образов
docker-compose -f docker-compose.prod.yml build

# Запуск в продакшне
docker-compose -f docker-compose.prod.yml up -d

# Мониторинг
docker-compose -f docker-compose.prod.yml logs -f
```

### Kubernetes

```bash
# Применение конфигураций
kubectl apply -f k8s/

# Проверка статуса
kubectl get pods
kubectl get services
```

## 🤝 Разработка

### Структура проекта

```
spot/
├── api-gateway/          # API Gateway сервис
├── user-service/         # Сервис пользователей
├── wallet-service/       # Сервис кошельков
├── trading-engine/       # Торговый движок (Go)
├── order-book-service/   # Сервис стакана заявок (Go)
├── notification-service/ # Сервис уведомлений
├── analytics-service/    # Сервис аналитики
├── market-maker-service/ # Сервис маркет-мейкинга
├── monitoring/          # Конфигурации мониторинга
├── docker-compose.yml   # Docker Compose конфигурация
└── README.md           # Документация
```

### Добавление нового сервиса

1. Создайте директорию для сервиса
2. Добавьте Dockerfile
3. Обновите docker-compose.yml
4. Добавьте health check
5. Обновите документацию

### Локальная разработка

```bash
# Запуск только необходимых сервисов
docker-compose up -d postgres redis kafka

# Запуск сервиса в режиме разработки
cd wallet-service
npm install
npm run start:dev
```

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📞 Поддержка

- Создайте Issue для багов
- Обсуждения в Discussions
- Документация в Wiki

---

**Статус проекта**: 🟢 Активная разработка

**Последнее обновление**: Январь 2024 