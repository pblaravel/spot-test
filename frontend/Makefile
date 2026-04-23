# Frontend Makefile
# Команды для управления Next.js приложением

.PHONY: help install build dev start test lint format clean docker-build docker-run docker-stop prepare

# Переменные
NODE_ENV ?= development
PORT ?= 3008
DOCKER_IMAGE = crypto-frontend
DOCKER_CONTAINER = crypto-frontend-container

help: ## Показать справку
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Установить зависимости
	@echo "Устанавливаем зависимости..."
	pnpm install

build: ## Собрать приложение для продакшена
	@echo "Собираем приложение..."
	NODE_ENV=production pnpm build

dev: ## Запустить в режиме разработки
	@echo "Запускаем в режиме разработки..."
	pnpm dev

start: ## Запустить продакшн сервер
	@echo "Запускаем продакшн сервер..."
	pnpm start

test: ## Запустить тесты
	@echo "Запускаем тесты..."
	pnpm test

lint: ## Проверить код линтером
	@echo "Проверяем код линтером..."
	pnpm lint

format: ## Форматировать код
	@echo "Форматируем код..."
	pnpm format

clean: ## Очистить кэш и временные файлы
	@echo "Очищаем кэш и временные файлы..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf .turbo

docker-build: ## Собрать Docker образ
	@echo "Собираем Docker образ..."
	docker build -t $(DOCKER_IMAGE) .

docker-run: ## Запустить Docker контейнер
	@echo "Запускаем Docker контейнер..."
	docker run -d \
		--name $(DOCKER_CONTAINER) \
		-p $(PORT):3000 \
		-e NODE_ENV=production \
		-e NEXT_PUBLIC_API_URL=http://localhost:3000 \
		$(DOCKER_IMAGE)

docker-stop: ## Остановить Docker контейнер
	@echo "Останавливаем Docker контейнер..."
	docker stop $(DOCKER_CONTAINER) || true
	docker rm $(DOCKER_CONTAINER) || true

docker-clean: ## Очистить Docker образы
	@echo "Очищаем Docker образы..."
	docker rmi $(DOCKER_IMAGE) || true

prepare: install lint build ## Подготовить к деплою (установить, проверить, собрать)
	@echo "Frontend готов к деплою!"

# Команды для разработки
dev-setup: install ## Настройка окружения разработки
	@echo "Окружение разработки настроено!"

# Команды для CI/CD
ci-install: ## Установка зависимостей для CI
	@echo "Устанавливаем зависимости для CI..."
	pnpm ci

ci-test: ci-install lint test ## Запуск тестов в CI
	@echo "Тесты в CI завершены!"

ci-build: ci-install build ## Сборка в CI
	@echo "Сборка в CI завершена!"

# Команды для мониторинга
logs: ## Показать логи Docker контейнера
	docker logs -f $(DOCKER_CONTAINER)

status: ## Показать статус Docker контейнера
	docker ps -a | grep $(DOCKER_CONTAINER) || echo "Контейнер не найден"

# Команды для отладки
debug: ## Запустить в режиме отладки
	@echo "Запускаем в режиме отладки..."
	NODE_ENV=development DEBUG=* pnpm dev

shell: ## Открыть shell в Docker контейнере
	docker exec -it $(DOCKER_CONTAINER) /bin/sh 