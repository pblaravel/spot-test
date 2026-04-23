#!/bin/bash

echo "🚀 Запуск криптобиржи с микросервисной архитектурой..."

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Без интерактива: очистка можно включить флагом CLEAN=1
if [ "$CLEAN" = "1" ]; then
  echo "🧹 Удаление старых данных..."
  docker-compose down -v
  docker system prune -f
fi

# Создаем необходимые директории
echo "📁 Создание директорий..."
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources

# Запускаем инфраструктуру (базы данных, Kafka, мониторинг)
echo "🏗️  Запуск инфраструктуры..."
docker-compose up -d postgres redis influxdb zookeeper kafka prometheus grafana kafka-ui

# Ждем готовности баз данных
echo "⏳ Ожидание готовности баз данных..."
sleep 10

# Проверяем готовность PostgreSQL
until docker-compose exec -T postgres pg_isready -U admin -d crypto_exchange; do
    echo "⏳ Ожидание PostgreSQL..."
    sleep 2
done

# Проверяем готовность Kafka
until docker-compose exec -T kafka kafka-topics --bootstrap-server localhost:9092 --list; do
    echo "⏳ Ожидание Kafka..."
    sleep 2
done

# Запускаем сервисы
echo "🚀 Запуск микросервисов..."

# Сначала запускаем Order Book Service (Go)
echo "📊 Запуск Order Book Service..."
docker-compose up -d order-book-service

# Затем Trading Engine (Go)
echo "⚡ Запуск Trading Engine..."
docker-compose up -d trading-engine

# Затем остальные сервисы
echo "👤 Запуск User Service..."
docker-compose up -d user-service

echo "💰 Запуск Wallet Service..."
docker-compose up -d wallet-service

echo "🔔 Запуск Notification Service..."
docker-compose up -d notification-service

echo "📈 Запуск Analytics Service..."
docker-compose up -d analytics-service

echo "🤖 Запуск Market Maker Service..."
docker-compose up -d market-maker-service

# В последнюю очередь API Gateway
echo "🌐 Запуск API Gateway..."
docker-compose up -d api-gateway

# Ждем запуска всех сервисов
echo "⏳ Ожидание запуска всех сервисов..."
sleep 15

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose ps

echo ""
echo "🎉 Криптобиржа запущена!"
echo ""
echo "📱 Доступные сервисы:"
echo "   • API Gateway: http://localhost:3000"
echo "   • User Service: http://localhost:3001"
echo "   • Wallet Service: http://localhost:3002"
echo "   • Notification Service: http://localhost:3003"
echo "   • Analytics Service: http://localhost:3004"
echo "   • Market Maker Service: http://localhost:3005"
echo "   • Trading Engine: http://localhost:8080"
echo "   • Order Book Service: http://localhost:8081"
echo ""
echo "🔧 Инфраструктура:"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo "   • InfluxDB: http://localhost:8086"
echo "   • Kafka UI: http://localhost:8080"
echo "   • Prometheus: http://localhost:9090"
echo "   • Grafana: http://localhost:3006 (admin/admin)"
echo ""
echo "📝 Логи:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🛑 Остановка:"
echo "   docker-compose down" 