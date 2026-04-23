# Crypto Exchange Platform - Общий Makefile
# Управление всеми сервисами платформы

.PHONY: help prepare-all prepare-api-gw prepare-user-service prepare-wallet-service prepare-trading-engine prepare-order-book prepare-notification-service prepare-analytics-service prepare-market-maker docker-build-all docker-run-all docker-stop-all clean-all deploy-railway

# Переменные
API_GATEWAY_DIR = api-gateway
USER_SERVICE_DIR = user-service
WALLET_SERVICE_DIR = wallet-service
TRADING_ENGINE_DIR = trading-engine
ORDER_BOOK_DIR = order-book-service
NOTIFICATION_SERVICE_DIR = notification-service
ANALYTICS_SERVICE_DIR = analytics-service
MARKET_MAKER_DIR = market-maker-service
FRONTEND_DIR = frontend

# Цвета для вывода
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Помощь
help:
	@echo "$(GREEN)Crypto Exchange Platform - Доступные команды:$(NC)"
	@echo ""
	@echo "$(YELLOW)Подготовка сервисов к деплою:$(NC)"
	@echo "  prepare-all              - Подготовить все сервисы к деплою"
	@echo "  prepare-api-gw           - Подготовить API Gateway"
	@echo "  prepare-user-service     - Подготовить User Service"
	@echo "  prepare-wallet-service   - Подготовить Wallet Service"
	@echo "  prepare-trading-engine   - Подготовить Trading Engine"
	@echo "  prepare-order-book       - Подготовить Order Book Service"
	@echo "  prepare-notification-service - Подготовить Notification Service"
	@echo "  prepare-analytics-service    - Подготовить Analytics Service"
	@echo "  prepare-market-maker     - Подготовить Market Maker Service"
	@echo ""
	@echo "$(YELLOW)Docker команды:$(NC)"
	@echo "  docker-build-all         - Собрать все Docker образы"
	@echo "  docker-run-all           - Запустить все сервисы в Docker"
	@echo "  docker-stop-all          - Остановить все Docker контейнеры"
	@echo ""
	@echo "$(YELLOW)Утилиты:$(NC)"
	@echo "  clean-all                - Очистить все собранные файлы"
	@echo "  status                   - Показать статус всех сервисов"
	@echo "  logs                     - Показать логи всех сервисов"
	@echo "  deploy-railway           - Деплой всего проекта на Railway (требуется Railway CLI)"
	@echo ""

# Подготовка всех сервисов
prepare-all: prepare-api-gw prepare-user-service prepare-wallet-service prepare-trading-engine prepare-order-book prepare-notification-service prepare-analytics-service prepare-market-maker prepare-frontend
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✅ Все сервисы готовы к деплою!$(NC)"
	@echo "$(GREEN)========================================$(NC)"

# Подготовка API Gateway
prepare-api-gw:
	@echo "$(BLUE)🔧 Подготавливаем API Gateway...$(NC)"
	@cd $(API_GATEWAY_DIR) && make prepare-api-gw

# Подготовка User Service
prepare-user-service:
	@echo "$(BLUE)🔧 Подготавливаем User Service...$(NC)"
	@cd $(USER_SERVICE_DIR) && make prepare-service

# Подготовка Wallet Service
prepare-wallet-service:
	@echo "$(BLUE)🔧 Подготавливаем Wallet Service...$(NC)"
	@cd $(WALLET_SERVICE_DIR) && make prepare-service

# Подготовка Trading Engine
prepare-trading-engine:
	@echo "$(BLUE)🔧 Подготавливаем Trading Engine...$(NC)"
	@cd $(TRADING_ENGINE_DIR) && make prepare-service

# Подготовка Order Book Service
prepare-order-book:
	@echo "$(BLUE)🔧 Подготавливаем Order Book Service...$(NC)"
	@cd $(ORDER_BOOK_DIR) && make prepare-service

# Подготовка Notification Service
prepare-notification-service:
	@echo "$(BLUE)🔧 Подготавливаем Notification Service...$(NC)"
	@cd $(NOTIFICATION_SERVICE_DIR) && make prepare-service

# Подготовка Analytics Service
prepare-analytics-service:
	@echo "$(BLUE)🔧 Подготавливаем Analytics Service...$(NC)"
	@cd $(ANALYTICS_SERVICE_DIR) && make prepare-service

# Подготовка Market Maker Service
prepare-market-maker:
	@echo "$(BLUE)🔧 Подготавливаем Market Maker Service...$(NC)"
	@cd $(MARKET_MAKER_DIR) && make prepare-service

# Подготовка Frontend
prepare-frontend:
	@echo "$(BLUE)🔧 Подготавливаем Frontend...$(NC)"
	@cd $(FRONTEND_DIR) && make prepare

# Сборка всех Docker образов
docker-build-all:
	@echo "$(GREEN)🐳 Собираем все Docker образы...$(NC)"
	@cd $(API_GATEWAY_DIR) && make docker-build
	@cd $(USER_SERVICE_DIR) && make docker-build
	@cd $(WALLET_SERVICE_DIR) && make docker-build
	@cd $(TRADING_ENGINE_DIR) && make docker-build
	@cd $(ORDER_BOOK_DIR) && make docker-build
	@cd $(NOTIFICATION_SERVICE_DIR) && make docker-build
	@cd $(ANALYTICS_SERVICE_DIR) && make docker-build
	@cd $(MARKET_MAKER_DIR) && make docker-build
	@cd $(FRONTEND_DIR) && make docker-build
	@echo "$(GREEN)✅ Все Docker образы собраны!$(NC)"

# Запуск всех сервисов в Docker
docker-run-all:
	@echo "$(GREEN)🚀 Запускаем все сервисы в Docker...$(NC)"
	@cd $(API_GATEWAY_DIR) && make docker-run
	@cd $(USER_SERVICE_DIR) && make docker-run
	@cd $(WALLET_SERVICE_DIR) && make docker-run
	@cd $(TRADING_ENGINE_DIR) && make docker-run
	@cd $(ORDER_BOOK_DIR) && make docker-run
	@cd $(NOTIFICATION_SERVICE_DIR) && make docker-run
	@cd $(ANALYTICS_SERVICE_DIR) && make docker-run
	@cd $(MARKET_MAKER_DIR) && make docker-run
	@echo "$(GREEN)✅ Все сервисы запущены!$(NC)"

# Остановка всех Docker контейнеров
docker-stop-all:
	@echo "$(YELLOW)🛑 Останавливаем все Docker контейнеры...$(NC)"
	@cd $(API_GATEWAY_DIR) && make docker-stop
	@cd $(USER_SERVICE_DIR) && make docker-stop
	@cd $(WALLET_SERVICE_DIR) && make docker-stop
	@cd $(TRADING_ENGINE_DIR) && make docker-stop
	@cd $(ORDER_BOOK_DIR) && make docker-stop
	@cd $(NOTIFICATION_SERVICE_DIR) && make docker-stop
	@cd $(ANALYTICS_SERVICE_DIR) && make docker-stop
	@cd $(MARKET_MAKER_DIR) && make docker-stop
	@echo "$(GREEN)✅ Все контейнеры остановлены!$(NC)"

# Очистка всех собранных файлов
clean-all:
	@echo "$(YELLOW)🧹 Очищаем все собранные файлы...$(NC)"
	@cd $(API_GATEWAY_DIR) && make clean
	@cd $(USER_SERVICE_DIR) && make clean
	@cd $(WALLET_SERVICE_DIR) && make clean
	@cd $(TRADING_ENGINE_DIR) && make clean
	@cd $(ORDER_BOOK_DIR) && make clean
	@cd $(NOTIFICATION_SERVICE_DIR) && make clean
	@cd $(ANALYTICS_SERVICE_DIR) && make clean
	@cd $(MARKET_MAKER_DIR) && make clean
	@echo "$(GREEN)✅ Очистка завершена!$(NC)"

# Статус всех сервисов
status:
	@echo "$(GREEN)📊 Статус всех сервисов:$(NC)"
	@echo ""
	@cd $(API_GATEWAY_DIR) && make status
	@echo ""
	@cd $(USER_SERVICE_DIR) && make status
	@echo ""
	@cd $(WALLET_SERVICE_DIR) && make status
	@echo ""
	@cd $(TRADING_ENGINE_DIR) && make status
	@echo ""
	@cd $(ORDER_BOOK_DIR) && make status
	@echo ""
	@cd $(NOTIFICATION_SERVICE_DIR) && make status
	@echo ""
	@cd $(ANALYTICS_SERVICE_DIR) && make status
	@echo ""
	@cd $(MARKET_MAKER_DIR) && make status

# Логи всех сервисов
logs:
	@echo "$(GREEN)📋 Логи всех сервисов:$(NC)"
	@echo ""
	@echo "$(YELLOW)API Gateway:$(NC)"
	@docker logs api-gateway-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)User Service:$(NC)"
	@docker logs user-service-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Wallet Service:$(NC)"
	@docker logs wallet-service-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Trading Engine:$(NC)"
	@docker logs trading-engine-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Order Book Service:$(NC)"
	@docker logs order-book-service-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Notification Service:$(NC)"
	@docker logs notification-service-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Analytics Service:$(NC)"
	@docker logs analytics-service-container 2>/dev/null || echo "Контейнер не запущен"
	@echo ""
	@echo "$(YELLOW)Market Maker Service:$(NC)"
	@docker logs market-maker-service-container 2>/dev/null || echo "Контейнер не запущен"

# Запуск через docker-compose
compose-up:
	@echo "$(GREEN)🚀 Запускаем все сервисы через docker-compose...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Все сервисы запущены через docker-compose!$(NC)"

# Остановка через docker-compose
compose-down:
	@echo "$(YELLOW)🛑 Останавливаем все сервисы через docker-compose...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Все сервисы остановлены!$(NC)"

# Логи через docker-compose
compose-logs:
	@echo "$(GREEN)📋 Логи всех сервисов:$(NC)"
	docker-compose logs

# Перезапуск через docker-compose
compose-restart:
	@echo "$(YELLOW)🔄 Перезапускаем все сервисы...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Все сервисы перезапущены!$(NC)"

# Проверка здоровья всех сервисов
health-check:
	@echo "$(GREEN)🏥 Проверяем здоровье всех сервисов...$(NC)"
	@echo "$(YELLOW)API Gateway:$(NC)"
	@curl -s http://localhost:3000/health || echo "Недоступен"
	@echo "$(YELLOW)User Service:$(NC)"
	@curl -s http://localhost:3001/health || echo "Недоступен"
	@echo "$(YELLOW)Wallet Service:$(NC)"
	@curl -s http://localhost:3003/health || echo "Недоступен"
	@echo "$(YELLOW)Trading Engine:$(NC)"
	@curl -s http://localhost:3002/health || echo "Недоступен"
	@echo "$(YELLOW)Order Book Service:$(NC)"
	@curl -s http://localhost:3007/health || echo "Недоступен"
	@echo "$(YELLOW)Notification Service:$(NC)"
	@curl -s http://localhost:3004/health || echo "Недоступен"
	@echo "$(YELLOW)Analytics Service:$(NC)"
	@curl -s http://localhost:3005/health || echo "Недоступен"
	@echo "$(YELLOW)Market Maker Service:$(NC)"
	@curl -s http://localhost:3006/health || echo "Недоступен"

# Установка зависимостей для всех сервисов
install-all:
	@echo "$(GREEN)📦 Устанавливаем зависимости для всех сервисов...$(NC)"
	@cd $(API_GATEWAY_DIR) && make install
	@cd $(USER_SERVICE_DIR) && make install
	@cd $(WALLET_SERVICE_DIR) && make install
	@cd $(NOTIFICATION_SERVICE_DIR) && make install
	@cd $(ANALYTICS_SERVICE_DIR) && make install
	@cd $(MARKET_MAKER_DIR) && make install
	@echo "$(GREEN)✅ Зависимости установлены для всех сервисов!$(NC)"

# Тестирование всех сервисов
test-all:
	@echo "$(GREEN)🧪 Запускаем тесты для всех сервисов...$(NC)"
	@cd $(API_GATEWAY_DIR) && make test
	@cd $(USER_SERVICE_DIR) && make test
	@cd $(WALLET_SERVICE_DIR) && make test
	@cd $(NOTIFICATION_SERVICE_DIR) && make test
	@cd $(ANALYTICS_SERVICE_DIR) && make test
	@cd $(MARKET_MAKER_DIR) && make test
	@echo "$(GREEN)✅ Тесты завершены для всех сервисов!$(NC)" 

deploy-railway:
	@echo "$(GREEN)🚀 Деплой всего проекта на Railway...$(NC)"
	railway up
	@echo "$(GREEN)✅ Деплой завершён!$(NC)" 