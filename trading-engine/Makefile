# Trading Engine Makefile
# Команды для разработки, тестирования и деплоя

.PHONY: help install build test test-watch test-cov lint lint-fix format clean prepare-service docker-build docker-run docker-stop

# Переменные
SERVICE_NAME = trading-engine
DOCKER_IMAGE = $(SERVICE_NAME):latest
DOCKER_CONTAINER = $(SERVICE_NAME)-container
PORT = 3002
BINARY_NAME = trading-engine

# Цвета для вывода
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Помощь
help:
	@echo "$(GREEN)Trading Engine - Доступные команды:$(NC)"
	@echo ""
	@echo "$(YELLOW)Установка и сборка:$(NC)"
	@echo "  install        - Установить зависимости"
	@echo "  build          - Собрать проект"
	@echo "  clean          - Очистить собранные файлы"
	@echo ""
	@echo "$(YELLOW)Тестирование:$(NC)"
	@echo "  test           - Запустить unit тесты"
	@echo "  test-watch     - Запустить тесты в режиме watch"
	@echo "  test-cov       - Запустить тесты с покрытием"
	@echo "  test-bench     - Запустить benchmark тесты"
	@echo ""
	@echo "$(YELLOW)Качество кода:$(NC)"
	@echo "  lint           - Проверить код линтером"
	@echo "  lint-fix       - Исправить ошибки линтера"
	@echo "  format         - Отформатировать код"
	@echo "  vet            - Проверить код с помощью go vet"
	@echo ""
	@echo "$(YELLOW)Деплой:$(NC)"
	@echo "  prepare-service - Подготовить сервис к деплою (lint + test + build)"
	@echo "  docker-build   - Собрать Docker образ"
	@echo "  docker-run     - Запустить Docker контейнер"
	@echo "  docker-stop    - Остановить Docker контейнер"
	@echo ""

# Установка зависимостей
install:
	@echo "$(GREEN)Устанавливаем зависимости...$(NC)"
	go mod download
	go mod tidy
	@echo "$(GREEN)Зависимости установлены!$(NC)"

# Сборка проекта
build:
	@echo "$(GREEN)Собираем проект...$(NC)"
	go build -o $(BINARY_NAME) .
	@echo "$(GREEN)Проект собран!$(NC)"

# Сборка для production
build-prod:
	@echo "$(GREEN)Создаем production сборку...$(NC)"
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o $(BINARY_NAME) .
	@echo "$(GREEN)Production сборка создана!$(NC)"

# Очистка
clean:
	@echo "$(YELLOW)Очищаем собранные файлы...$(NC)"
	rm -f $(BINARY_NAME)
	rm -rf coverage/
	@echo "$(GREEN)Очистка завершена!$(NC)"

# Unit тесты
test:
	@echo "$(GREEN)Запускаем unit тесты...$(NC)"
	go test ./...
	@echo "$(GREEN)Unit тесты завершены!$(NC)"

# Тесты в режиме watch (требует установки air)
test-watch:
	@echo "$(GREEN)Запускаем тесты в режиме watch...$(NC)"
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "$(YELLOW)Air не установлен. Установите: go install github.com/cosmtrek/air@latest$(NC)"; \
		echo "$(YELLOW)Или используйте: go test ./... -watch$(NC)"; \
	fi

# Тесты с покрытием
test-cov:
	@echo "$(GREEN)Запускаем тесты с покрытием...$(NC)"
	mkdir -p coverage
	go test ./... -coverprofile=coverage/coverage.out
	go tool cover -html=coverage/coverage.out -o coverage/coverage.html
	go tool cover -func=coverage/coverage.out
	@echo "$(GREEN)Отчет о покрытии создан в coverage/$(NC)"

# Benchmark тесты
test-bench:
	@echo "$(GREEN)Запускаем benchmark тесты...$(NC)"
	go test -bench=. ./...
	@echo "$(GREEN)Benchmark тесты завершены!$(NC)"

# Проверка линтером
lint:
	@echo "$(GREEN)Проверяем код линтером...$(NC)"
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run; \
	else \
		echo "$(YELLOW)golangci-lint не установлен. Устанавливаем...$(NC)"; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run; \
	fi
	@echo "$(GREEN)Проверка линтером завершена!$(NC)"

# Исправление ошибок линтера
lint-fix:
	@echo "$(YELLOW)Исправляем ошибки линтера...$(NC)"
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run --fix; \
	else \
		echo "$(YELLOW)golangci-lint не установлен. Устанавливаем...$(NC)"; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run --fix; \
	fi
	@echo "$(GREEN)Ошибки линтера исправлены!$(NC)"

# Форматирование кода
format:
	@echo "$(GREEN)Форматируем код...$(NC)"
	go fmt ./...
	@echo "$(GREEN)Код отформатирован!$(NC)"

# Проверка кода с помощью go vet
vet:
	@echo "$(GREEN)Проверяем код с помощью go vet...$(NC)"
	go vet ./...
	@echo "$(GREEN)Проверка go vet завершена!$(NC)"

# Подготовка к деплою (основная команда)
prepare-service: install lint vet test test-cov build-prod
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(GREEN)✅ Trading Engine готов к деплою!$(NC)"
	@echo "$(GREEN)========================================$(NC)"
	@echo "$(YELLOW)Выполненные проверки:$(NC)"
	@echo "  ✅ Зависимости установлены"
	@echo "  ✅ Код проверен линтером"
	@echo "  ✅ Код проверен go vet"
	@echo "  ✅ Unit тесты пройдены"
	@echo "  ✅ Покрытие кода проверено"
	@echo "  ✅ Production сборка создана"
	@echo ""
	@echo "$(GREEN)Сервис готов к деплою!$(NC)"

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

docker-stop:
	@echo "$(YELLOW)Останавливаем Docker контейнер...$(NC)"
	docker stop $(DOCKER_CONTAINER) || true
	docker rm $(DOCKER_CONTAINER) || true
	@echo "$(GREEN)Контейнер остановлен и удален!$(NC)"

# Дополнительные команды для разработки
dev:
	@echo "$(GREEN)Запускаем в режиме разработки...$(NC)"
	go run .

dev-debug:
	@echo "$(GREEN)Запускаем в debug режиме...$(NC)"
	dlv debug .

# Проверка статуса
status:
	@echo "$(GREEN)Статус Trading Engine:$(NC)"
	@echo "  Go версия: $(shell go version)"
	@echo "  Docker: $(shell docker --version 2>/dev/null || echo 'Не установлен')"
	@echo "  Порт: $(PORT)"
	@echo "  Сервис: $(SERVICE_NAME)"
	@echo "  Бинарный файл: $(BINARY_NAME)"

# Полная очистка
clean-all: clean
	@echo "$(YELLOW)Удаляем go mod cache...$(NC)"
	go clean -modcache
	@echo "$(GREEN)Полная очистка завершена!$(NC)"

# Переустановка зависимостей
reinstall: clean-all install
	@echo "$(GREEN)Зависимости переустановлены!$(NC)"

# Проверка безопасности
security-check:
	@echo "$(GREEN)Проверяем уязвимости...$(NC)"
	@if command -v gosec > /dev/null; then \
		gosec ./...; \
	else \
		echo "$(YELLOW)gosec не установлен. Устанавливаем...$(NC)"; \
		go install github.com/securecodewarrior/gosec/v2/cmd/gosec@latest; \
		gosec ./...; \
	fi
	@echo "$(GREEN)Проверка безопасности завершена!$(NC)"

# Обновление зависимостей
update-deps:
	@echo "$(YELLOW)Обновляем зависимости...$(NC)"
	go get -u ./...
	go mod tidy
	@echo "$(GREEN)Зависимости обновлены!$(NC)"

# Запуск production версии
start-prod:
	@echo "$(GREEN)Запускаем production версию...$(NC)"
	./$(BINARY_NAME)

# Генерация документации
docs:
	@echo "$(GREEN)Генерируем документацию...$(NC)"
	@if command -v godoc > /dev/null; then \
		godoc -http=:6060; \
	else \
		echo "$(YELLOW)godoc не установлен. Устанавливаем...$(NC)"; \
		go install golang.org/x/tools/cmd/godoc@latest; \
		godoc -http=:6060; \
	fi

# Проверка race conditions
race:
	@echo "$(GREEN)Проверяем race conditions...$(NC)"
	go test -race ./...
	@echo "$(GREEN)Проверка race conditions завершена!$(NC)"

# Профилирование
profile:
	@echo "$(GREEN)Запускаем с профилированием...$(NC)"
	go run . -cpuprofile=cpu.prof -memprofile=mem.prof
	@echo "$(GREEN)Профили созданы: cpu.prof, mem.prof$(NC)"

# Анализ профилей
analyze-profile:
	@echo "$(GREEN)Анализируем профили...$(NC)"
	@if [ -f cpu.prof ]; then \
		go tool pprof cpu.prof; \
	fi
	@if [ -f mem.prof ]; then \
		go tool pprof mem.prof; \
	fi 