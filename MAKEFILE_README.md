# Makefile - Управление Crypto Exchange Platform

Этот документ описывает использование Makefile для управления всеми сервисами платформы.

## 🚀 Быстрый старт

### Подготовка API Gateway к деплою
```bash
make prepare-api-gw
```

### Подготовка всех сервисов к деплою
```bash
make prepare-all
```

### Запуск всех сервисов через Docker
```bash
make docker-run-all
```

## 📋 Доступные команды

### Основные команды

| Команда | Описание |
|---------|----------|
| `make help` | Показать справку по всем командам |
| `make prepare-api-gw` | Подготовить API Gateway к деплою |
| `make prepare-all` | Подготовить все сервисы к деплою |
| `make docker-build-all` | Собрать все Docker образы |
| `make docker-run-all` | Запустить все сервисы в Docker |
| `make docker-stop-all` | Остановить все Docker контейнеры |

### Команды для отдельных сервисов

| Команда | Описание |
|---------|----------|
| `make prepare-user-service` | Подготовить User Service |
| `make prepare-wallet-service` | Подготовить Wallet Service |
| `make prepare-trading-engine` | Подготовить Trading Engine |
| `make prepare-order-book` | Подготовить Order Book Service |
| `make prepare-notification-service` | Подготовить Notification Service |
| `make prepare-analytics-service` | Подготовить Analytics Service |
| `make prepare-market-maker` | Подготовить Market Maker Service |

### Утилиты

| Команда | Описание |
|---------|----------|
| `make clean-all` | Очистить все собранные файлы |
| `make status` | Показать статус всех сервисов |
| `make logs` | Показать логи всех сервисов |
| `make health-check` | Проверить здоровье всех сервисов |
| `make install-all` | Установить зависимости для всех сервисов |
| `make test-all` | Запустить тесты для всех сервисов |

### Docker Compose команды

| Команда | Описание |
|---------|----------|
| `make compose-up` | Запустить все сервисы через docker-compose |
| `make compose-down` | Остановить все сервисы через docker-compose |
| `make compose-logs` | Показать логи через docker-compose |
| `make compose-restart` | Перезапустить все сервисы |

## 🔧 Команды для отдельных сервисов

### API Gateway

```bash
cd api-gateway
make help                    # Справка
make install                 # Установить зависимости
make build                   # Собрать проект
make test                    # Запустить тесты
make test-cov                # Тесты с покрытием
make test-e2e                # E2E тесты
make lint                    # Проверить код линтером
make lint-fix                # Исправить ошибки линтера
make format                  # Отформатировать код
make prepare-api-gw          # Подготовить к деплою
make docker-build            # Собрать Docker образ
make docker-run              # Запустить Docker контейнер
make docker-stop             # Остановить Docker контейнер
make dev                     # Режим разработки
make status                  # Статус сервиса
```

### User Service (NestJS)

```bash
cd user-service
make help                    # Справка
make install                 # Установить зависимости
make build                   # Собрать проект
make test                    # Запустить тесты
make test-cov                # Тесты с покрытием
make test-e2e                # E2E тесты
make lint                    # Проверить код линтером
make lint-fix                # Исправить ошибки линтера
make format                  # Отформатировать код
make prepare-service         # Подготовить к деплою
make docker-build            # Собрать Docker образ
make docker-run              # Запустить Docker контейнер
make docker-stop             # Остановить Docker контейнер
make dev                     # Режим разработки
make status                  # Статус сервиса
```

### Trading Engine (Go)

```bash
cd trading-engine
make help                    # Справка
make install                 # Установить зависимости
make build                   # Собрать проект
make test                    # Запустить тесты
make test-cov                # Тесты с покрытием
make test-bench              # Benchmark тесты
make lint                    # Проверить код линтером
make lint-fix                # Исправить ошибки линтера
make format                  # Отформатировать код
make vet                     # Проверить код go vet
make prepare-service         # Подготовить к деплою
make docker-build            # Собрать Docker образ
make docker-run              # Запустить Docker контейнер
make docker-stop             # Остановить Docker контейнер
make dev                     # Режим разработки
make status                  # Статус сервиса
make race                    # Проверить race conditions
make profile                 # Профилирование
```

## 🎯 Что делает команда `prepare-api-gw`

Команда `make prepare-api-gw` выполняет следующие шаги:

1. **Установка зависимостей** (`npm install`)
2. **Проверка линтером** (`npm run lint`)
3. **Unit тесты** (`npm test`)
4. **Тесты с покрытием** (`npm run test:cov`)
5. **E2E тесты** (`npm run test:e2e`)
6. **Сборка проекта** (`npm run build`)

После успешного выполнения всех шагов сервис готов к деплою.

## 🎯 Что делает команда `prepare-all`

Команда `make prepare-all` выполняет подготовку всех сервисов:

1. **API Gateway** - `make prepare-api-gw`
2. **User Service** - `make prepare-service`
3. **Wallet Service** - `make prepare-service`
4. **Trading Engine** - `make prepare-service`
5. **Order Book Service** - `make prepare-service`
6. **Notification Service** - `make prepare-service`
7. **Analytics Service** - `make prepare-service`
8. **Market Maker Service** - `make prepare-service`

## 🐳 Docker команды

### Сборка образов
```bash
# Собрать все образы
make docker-build-all

# Собрать конкретный сервис
cd api-gateway && make docker-build
```

### Запуск контейнеров
```bash
# Запустить все сервисы
make docker-run-all

# Запустить конкретный сервис
cd api-gateway && make docker-run
```

### Остановка контейнеров
```bash
# Остановить все контейнеры
make docker-stop-all

# Остановить конкретный сервис
cd api-gateway && make docker-stop
```

## 📊 Мониторинг

### Статус сервисов
```bash
make status
```

### Логи сервисов
```bash
make logs
```

### Проверка здоровья
```bash
make health-check
```

## 🔍 Отладка

### Просмотр логов конкретного сервиса
```bash
# API Gateway
docker logs api-gateway-container

# User Service
docker logs user-service-container

# Trading Engine
docker logs trading-engine-container
```

### Вход в контейнер
```bash
# API Gateway
docker exec -it api-gateway-container sh

# User Service
docker exec -it user-service-container sh

# Trading Engine
docker exec -it trading-engine-container sh
```

## 🛠️ Разработка

### Режим разработки
```bash
# API Gateway
cd api-gateway && make dev

# User Service
cd user-service && make dev

# Trading Engine
cd trading-engine && make dev
```

### Тестирование в режиме watch
```bash
# API Gateway
cd api-gateway && make test-watch

# User Service
cd user-service && make test-watch

# Trading Engine
cd trading-engine && make test-watch
```

## 📁 Структура Makefile

```
├── Makefile                    # Общий Makefile для всех сервисов
├── api-gateway/
│   └── Makefile               # Makefile для API Gateway
├── user-service/
│   └── Makefile               # Makefile для User Service
├── wallet-service/
│   └── Makefile               # Makefile для Wallet Service
├── trading-engine/
│   └── Makefile               # Makefile для Trading Engine
├── order-book-service/
│   └── Makefile               # Makefile для Order Book Service
├── notification-service/
│   └── Makefile               # Makefile для Notification Service
├── analytics-service/
│   └── Makefile               # Makefile для Analytics Service
└── market-maker-service/
    └── Makefile               # Makefile для Market Maker Service
```

## ⚠️ Требования

### Для Node.js сервисов
- Node.js 18+
- npm 9+
- Docker (опционально)

### Для Go сервисов
- Go 1.21+
- golangci-lint (устанавливается автоматически)
- Docker (опционально)

### Общие требования
- Make
- Docker (для Docker команд)
- curl (для health-check)

## 🚨 Troubleshooting

### Ошибки линтера
```bash
# Исправить ошибки линтера
cd api-gateway && make lint-fix
```

### Очистка кэша
```bash
# Очистить все собранные файлы
make clean-all

# Переустановить зависимости
make install-all
```

### Проблемы с Docker
```bash
# Остановить все контейнеры
make docker-stop-all

# Удалить все образы
docker system prune -a

# Пересобрать образы
make docker-build-all
```

### Проблемы с тестами
```bash
# Очистить кэш Jest
cd api-gateway && npx jest --clearCache

# Запустить тесты с подробным выводом
cd api-gateway && npx jest --verbose
```

## 📝 Примеры использования

### Полный цикл разработки
```bash
# 1. Подготовить все сервисы
make prepare-all

# 2. Собрать Docker образы
make docker-build-all

# 3. Запустить все сервисы
make docker-run-all

# 4. Проверить статус
make status

# 5. Проверить здоровье
make health-check
```

### Разработка конкретного сервиса
```bash
# 1. Перейти в директорию сервиса
cd api-gateway

# 2. Установить зависимости
make install

# 3. Запустить в режиме разработки
make dev

# 4. В другом терминале запустить тесты в watch режиме
make test-watch
```

### CI/CD пайплайн
```bash
# 1. Установить зависимости
make install-all

# 2. Запустить тесты
make test-all

# 3. Подготовить к деплою
make prepare-all

# 4. Собрать Docker образы
make docker-build-all
``` 