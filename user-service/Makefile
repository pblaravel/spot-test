# User Service Makefile
# Команды для разработки, тестирования и деплоя

.PHONY: help install build start dev test test-watch test-e2e test-cov lint format clean docker-build docker-run

# Переменные
SERVICE_NAME = user-service
DOCKER_IMAGE = $(SERVICE_NAME):latest
DOCKER_CONTAINER = $(SERVICE_NAME)-container
PORT = 3001

# Цвета для вывода
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Помощь
help:
	@echo "$(GREEN)User Service - Доступные команды:$(NC)"
	@echo ""
	@echo "$(YELLOW)Установка и сборка:$(NC)"
	@echo "  install        - Установить зависимости"
	@echo "  build          - Собрать проект"
	@echo "  start          - Запустить проект в production режиме"
	@echo "  dev            - Запустить проект в development режиме"
	@echo "  clean          - Очистить собранные файлы"
	@echo ""
	@echo "$(YELLOW)Тестирование:$(NC)"
	@echo "  test           - Запустить unit тесты"
	@echo "  test-watch     - Запустить тесты в режиме watch"
	@echo "  test-cov       - Запустить тесты с покрытием"
	@echo "  test-e2e       - Запустить e2e тесты"
	@echo ""
	@echo "$(YELLOW)Качество кода:$(NC)"
	@echo "  lint           - Проверить код линтером"
	@echo "  format         - Отформатировать код"
	@echo ""
	@echo "$(YELLOW)Деплой:$(NC)"
	@echo "  docker-build   - Собрать Docker образ"
	@echo "  docker-run     - Запустить Docker контейнер"
	@echo ""

# Установка зависимостей
install:
	@echo "$(GREEN)Устанавливаем зависимости...$(NC)"
	npm install
	@echo "$(GREEN)Зависимости установлены!$(NC)"

# Сборка проекта
build:
	@echo "$(GREEN)Собираем проект...$(NC)"
	npm run build
	@echo "$(GREEN)Проект собран!$(NC)"

# Очистка
clean:
	@echo "$(YELLOW)Очищаем собранные файлы...$(NC)"
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/.cache/
	@echo "$(GREEN)Очистка завершена!$(NC)"

# Unit тесты
test:
	@echo "$(GREEN)Запускаем unit тесты...$(NC)"
	npm test
	@echo "$(GREEN)Unit тесты завершены!$(NC)"

# Тесты в режиме watch
test-watch:
	@echo "$(GREEN)Запускаем тесты в режиме watch...$(NC)"
	npm run test:watch

# Тесты с покрытием
test-cov:
	@echo "$(GREEN)Запускаем тесты с покрытием...$(NC)"
	npm run test:cov
	@echo "$(GREEN)Отчет о покрытии создан в coverage/$(NC)"

# E2E тесты
test-e2e:
	@echo "$(GREEN)Запускаем e2e тесты...$(NC)"
	npm run test:e2e
	@echo "$(GREEN)E2E тесты завершены!$(NC)"

# Проверка линтером
lint:
	@echo "$(GREEN)Проверяем код линтером...$(NC)"
	npm run lint
	@echo "$(GREEN)Проверка линтером завершена!$(NC)"

# Форматирование кода
format:
	@echo "$(GREEN)Форматируем код...$(NC)"
	npm run format
	@echo "$(GREEN)Код отформатирован!$(NC)"

# Запуск проекта в production режиме
start:
	@echo "$(GREEN)Запускаем проект в production режиме...$(NC)"
	npm run start:prod

# Запуск проекта в development режиме
dev:
	@echo "$(GREEN)Запускаем проект в development режиме...$(NC)"
	npm run start:dev

# Docker команды
docker-build:
	@echo "$(GREEN)Собираем Docker образ...$(NC)"
	docker build -t $(DOCKER_IMAGE) .
	@echo "$(GREEN)Docker образ создан: $(DOCKER_IMAGE)$(NC)"

docker-run:
	@echo "$(GREEN)Запускаем Docker контейнер...$(NC)"
	docker run -d \
		--name $(DOCKER_CONTAINER) \
		-p $(PORT):$(PORT) \
		--env-file .env \
		$(DOCKER_IMAGE)
	@echo "$(GREEN)Контейнер запущен: $(DOCKER_CONTAINER)$(NC)"
	@echo "$(YELLOW)Сервис доступен по адресу: http://localhost:$(PORT)$(NC)"

# Запуск всех тестов
test-all: test test-e2e

# Подготовка к деплою (основная команда)
prepare-service: install lint test test-cov test-e2e build
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✅ User Service готов к деплою!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(YELLOW)Выполненные проверки:$(NC)"
	@echo "  ✅ Зависимости установлены"
	@echo "  ✅ Код проверен линтером"
	@echo "  ✅ Unit тесты пройдены"
	@echo "  ✅ Покрытие кода проверено"
	@echo "  ✅ E2E тесты пройдены"
	@echo "  ✅ Проект собран"
	@echo ""
	@echo "$(GREEN)Сервис готов к деплою!$(NC)"

# Проверка статуса
status:
	@echo "$(GREEN)Статус User Service:$(NC)"
	@echo "  Node.js версия: $(shell node --version)"
	@echo "  NPM версия: $(shell npm --version)"
	@echo "  Docker: $(shell docker --version 2>/dev/null || echo 'Не установлен')"
	@echo "  Порт: $(PORT)"
	@echo "  Сервис: $(SERVICE_NAME)"

# Полная очистка (включая node_modules)
clean-all: clean
	@echo "$(YELLOW)Удаляем node_modules...$(NC)"
	rm -rf node_modules/
	@echo "$(GREEN)Полная очистка завершена!$(NC)"

# Переустановка зависимостей
reinstall: clean-all install
	@echo "$(GREEN)Зависимости переустановлены!$(NC)"

# Проверка безопасности
security-check:
	@echo "$(GREEN)Проверяем уязвимости...$(NC)"
	npm audit
	@echo "$(GREEN)Проверка безопасности завершена!$(NC)"

# Обновление зависимостей
update-deps:
	@echo "$(YELLOW)Обновляем зависимости...$(NC)"
	npm update
	@echo "$(GREEN)Зависимости обновлены!$(NC)"

# Создание production сборки
build-prod:
	@echo "$(GREEN)Создаем production сборку...$(NC)"
	NODE_ENV=production npm run build
	@echo "$(GREEN)Production сборка создана!$(NC)"

# Запуск production версии
start-prod:
	@echo "$(GREEN)Запускаем production версию...$(NC)"
	NODE_ENV=production npm run start:prod

# Полная разработка
dev-workflow: format lint test build
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✅ User Service готов к разработке!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(YELLOW)Выполненные проверки:$(NC)"
	@echo "  ✅ Код отформатирован"
	@echo "  ✅ Код проверен линтером"
	@echo "  ✅ Unit тесты пройдены"
	@echo "  ✅ Проект собран"
	@echo ""
	@echo "$(GREEN)Сервис готов к разработке!$(NC)" 