# 🚀 Быстрый старт - Криптобиржа

## 📋 Предварительные требования

- **Docker** (версия 20.10+)
- **Docker Compose** (версия 2.0+)
- **Git**

## ⚡ Быстрый запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd spot
```

### 2. Запуск всех сервисов

```bash
# Сделать скрипт исполняемым
chmod +x start.sh

# Запустить все сервисы
./start.sh
```

### 3. Проверка статуса

```bash
# Проверить статус всех контейнеров
docker-compose ps

# Просмотр логов конкретного сервиса
docker-compose logs -f api-gateway
```

## 🌐 Доступные сервисы

После успешного запуска доступны:

### API Endpoints
- **API Gateway**: http://localhost:3000
- **User Service**: http://localhost:3001
- **Wallet Service**: http://localhost:3002
- **Notification Service**: http://localhost:3003
- **Analytics Service**: http://localhost:3004
- **Market Maker Service**: http://localhost:3005
- **Trading Engine**: http://localhost:8080
- **Order Book Service**: http://localhost:8081

### Инфраструктура
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **InfluxDB**: http://localhost:8086
- **Kafka UI**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3006 (admin/admin)

## 🔧 Основные команды

### Управление сервисами

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart api-gateway

# Просмотр логов
docker-compose logs -f [service-name]

# Масштабирование сервиса
docker-compose up -d --scale user-service=3
```

### Разработка

```bash
# Запуск только инфраструктуры
docker-compose up -d postgres redis influxdb zookeeper kafka

# Установка зависимостей для NestJS сервисов
cd api-gateway && npm install
cd ../user-service && npm install

# Установка зависимостей для Go сервисов
cd trading-engine && go mod tidy
cd ../order-book-service && go mod tidy

# Локальный запуск сервисов
npm run start:dev  # для NestJS
go run main.go     # для Go
```

## 📊 Мониторинг

### Grafana
- URL: http://localhost:3006
- Логин: `admin`
- Пароль: `admin`

### Prometheus
- URL: http://localhost:9090
- Метрики всех сервисов

### Kafka UI
- URL: http://localhost:8080
- Управление топиками и сообщениями

## 🧪 Тестирование API

### Проверка health endpoints

```bash
# API Gateway
curl http://localhost:3000/health

# User Service
curl http://localhost:3001/health

# Trading Engine
curl http://localhost:8080/health

# Order Book Service
curl http://localhost:8081/health
```

### Создание пользователя

```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Получение стакана ордеров

```bash
curl http://localhost:8081/api/v1/orderbook/BTC/USDT
```

## 🔍 Отладка

### Просмотр логов

```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs -f trading-engine

# Логи с временными метками
docker-compose logs -f --timestamps api-gateway
```

### Подключение к базе данных

```bash
# PostgreSQL
docker-compose exec postgres psql -U admin -d crypto_exchange

# Redis
docker-compose exec redis redis-cli
```

### Проверка Kafka

```bash
# Список топиков
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Просмотр сообщений в топике
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic trades \
  --from-beginning
```

## 🚨 Устранение неполадок

### Проблемы с портами

```bash
# Проверить занятые порты
lsof -i :3000
lsof -i :8080

# Остановить процессы на портах
sudo kill -9 $(lsof -t -i:3000)
```

### Проблемы с Docker

```bash
# Очистка Docker
docker system prune -a
docker volume prune

# Пересборка образов
docker-compose build --no-cache
```

### Проблемы с базой данных

```bash
# Сброс базы данных
docker-compose down -v
docker-compose up -d postgres
```

## 📈 Масштабирование

### Горизонтальное масштабирование

```bash
# Масштабирование API Gateway
docker-compose up -d --scale api-gateway=3

# Масштабирование Trading Engine
docker-compose up -d --scale trading-engine=2

# Масштабирование User Service
docker-compose up -d --scale user-service=3
```

### Мониторинг производительности

```bash
# Использование ресурсов
docker stats

# Метрики Prometheus
curl http://localhost:9090/api/v1/query?query=up
```

## 🔒 Безопасность

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Базы данных
DATABASE_URL=postgresql://admin:password@postgres:5432/crypto_exchange
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Kafka
KAFKA_BROKERS=kafka:9092

# Мониторинг
PROMETHEUS_PORT=9090
GRAFANA_PORT=3006
```

### HTTPS в продакшене

```bash
# Генерация SSL сертификатов
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx.key -out nginx.crt

# Настройка Nginx с SSL
# (добавить в docker-compose.prod.yml)
```

## 📚 Дополнительные ресурсы

- [Документация NestJS](https://docs.nestjs.com/)
- [Документация Go](https://golang.org/doc/)
- [Документация Kafka](https://kafka.apache.org/documentation/)
- [Документация Docker](https://docs.docker.com/)
- [Документация Prometheus](https://prometheus.io/docs/)

## 🆘 Поддержка

- Создайте Issue в GitHub для багов
- Проверьте логи сервисов
- Убедитесь, что все порты свободны
- Проверьте версии Docker и Docker Compose

---

**Примечание**: Это демонстрационная версия. Для продакшена требуется дополнительная настройка безопасности и мониторинга. 