# Railway Deployment Guide

## Обзор

Этот проект настроен для деплоя на Railway с использованием конфигурации как код (Configuration as Code).

## Структура сервисов

### Основные сервисы
- **api-gateway** - API Gateway (NestJS)
- **user-service** - Сервис пользователей (NestJS)
- **wallet-service** - Сервис кошельков (NestJS)
- **trading-engine** - Торговый движок (Go)
- **order-book-service** - Сервис ордербука (Go)
- **notification-service** - Сервис уведомлений (NestJS)
- **analytics-service** - Сервис аналитики (NestJS)
- **market-maker-service** - Сервис маркет-мейкера (NestJS)
- **frontend** - Веб-интерфейс (Next.js)

### Инфраструктурные сервисы
- **kafka-ui** - Веб-интерфейс для Kafka
- **grafana** - Мониторинг и дашборды
- **prometheus** - Сбор метрик

## Плагины

### База данных
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и сессии
- **Kafka** - обмен сообщениями
- **InfluxDB** - временные ряды для аналитики

## Конфигурация

### Builders
Все сервисы используют `nixpacks` builder для автоматического определения технологий:

- **Node.js сервисы**: NestJS приложения
- **Go сервисы**: Go приложения с конфигурацией в `nixpacks.toml`

### Health Checks
Все сервисы имеют настроенные health checks:
- `/health` - для основных сервисов
- `/` - для Kafka UI
- `/api/health` - для Grafana
- `/-/healthy` - для Prometheus

## Переменные окружения

### Общие переменные
- `PORT` - порт сервиса
- `NODE_ENV` - окружение (production)
- `DATABASE_URL` - строка подключения к PostgreSQL
- `REDIS_URL` - строка подключения к Redis
- `KAFKA_BROKERS` - адреса брокеров Kafka

### Специфичные переменные
- `JWT_SECRET` - секрет для JWT токенов
- `JWT_EXPIRES_IN` - время жизни JWT токенов
- `ALLOWED_ORIGINS` - разрешенные домены для CORS
- `NEXT_PUBLIC_API_URL` - URL API для фронтенда

## Деплой

### Автоматический деплой
1. Подключите репозиторий к Railway
2. Railway автоматически определит структуру проекта
3. Все сервисы будут развернуты согласно `railway.toml`

### Ручной деплой
```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Деплой
railway up
```

## Мониторинг

### Grafana
- URL: `https://grafana.up.railway.app`
- Логин: `admin`
- Пароль: `admin`

### Prometheus
- URL: `https://prometheus.up.railway.app`
- Метрики доступны по адресу: `/metrics`

### Kafka UI
- URL: `https://kafka-ui.up.railway.app`
- Для просмотра топиков и сообщений

## Troubleshooting

### Проблемы с подключением к базе данных
1. Проверьте переменную `DATABASE_URL`
2. Убедитесь, что PostgreSQL плагин подключен
3. Проверьте логи сервиса

### Проблемы с Redis
1. Проверьте переменную `REDIS_URL`
2. Убедитесь, что Redis плагин подключен

### Проблемы с Kafka
1. Проверьте переменную `KAFKA_BROKERS`
2. Убедитесь, что Kafka плагин подключен

### Проблемы с health checks
1. Проверьте, что сервис отвечает на `/health`
2. Убедитесь, что порт правильно настроен
3. Проверьте логи сервиса

## Безопасность

### Рекомендации
1. Измените `JWT_SECRET` на уникальный секрет
2. Настройте `ALLOWED_ORIGINS` для вашего домена
3. Используйте переменные окружения для секретов
4. Включите HTTPS для всех сервисов

### Переменные для изменения
- `JWT_SECRET` - замените на уникальный секрет
- `ALLOWED_ORIGINS` - укажите ваш домен
- `GRAFANA_ADMIN_PASSWORD` - измените пароль Grafana

## Масштабирование

### Автоматическое масштабирование
Railway автоматически масштабирует сервисы на основе нагрузки.

### Ручное масштабирование
```bash
# Увеличение количества реплик
railway scale api-gateway --replicas 3

# Увеличение ресурсов
railway scale api-gateway --cpu 2 --memory 4GB
```

## Логи

### Просмотр логов
```bash
# Логи конкретного сервиса
railway logs api-gateway

# Логи всех сервисов
railway logs
```

### Мониторинг логов
- Используйте Grafana для визуализации логов
- Настройте алерты в Prometheus
- Мониторьте ошибки через Railway Dashboard 