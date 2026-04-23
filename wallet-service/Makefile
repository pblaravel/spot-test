# Wallet Service Makefile

.PHONY: help install build test test-watch test-cov test-e2e lint format clean docker-build docker-run prepare

# Default target
help:
	@echo "Wallet Service - Available commands:"
	@echo "  install      - Install dependencies"
	@echo "  build        - Build the application"
	@echo "  start        - Start the application in development mode"
	@echo "  start-prod   - Start the application in production mode"
	@echo "  test         - Run unit tests"
	@echo "  test-watch   - Run tests in watch mode"
	@echo "  test-cov     - Run tests with coverage"
	@echo "  test-e2e     - Run end-to-end tests"
	@echo "  lint         - Run ESLint"
	@echo "  format       - Format code with Prettier"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo "  prepare      - Install, lint, test, and build"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the application
build:
	@echo "Building application..."
	npm run build

# Start in development mode
start:
	@echo "Starting in development mode..."
	npm run start:dev

# Start in production mode
start-prod:
	@echo "Starting in production mode..."
	npm run start:prod

# Run unit tests
test:
	@echo "Running unit tests..."
	npm test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	npm run test:watch

# Run tests with coverage
test-cov:
	@echo "Running tests with coverage..."
	npm run test:cov

# Run end-to-end tests
test-e2e:
	@echo "Running end-to-end tests..."
	npm run test:e2e

# Run ESLint
lint:
	@echo "Running ESLint..."
	npm run lint

# Format code with Prettier
format:
	@echo "Formatting code..."
	npm run format

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf coverage/
	rm -rf node_modules/

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t wallet-service .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 3002:3002 wallet-service

# Prepare for deployment (install, lint, test, build)
prepare: install lint test build
	@echo "Wallet Service prepared for deployment!"

# Quick development setup
dev-setup: install
	@echo "Development setup complete!"
	@echo "Run 'make start' to start the development server"
	@echo "Run 'make test' to run tests"
	@echo "Run 'make lint' to check code quality"

# Health check
health:
	@echo "Checking wallet service health..."
	@curl -f http://localhost:3002/api/v1/health || echo "Service not responding"

# Logs
logs:
	@echo "Showing wallet service logs..."
	docker logs -f wallet-service || echo "Container not running"

# Status
status:
	@echo "Wallet Service Status:"
	@echo "======================"
	@docker ps --filter name=wallet-service --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "Container not running"
	@echo ""
	@echo "Port 3002: $(shell lsof -i :3002 > /dev/null 2>&1 && echo "IN USE" || echo "AVAILABLE") 