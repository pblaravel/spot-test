#!/usr/bin/env bash
# Локальный запуск стека для входа в UI при сломанном bridge Docker (сервисы достучатся до Postgres/Redis только с хоста localhost).
# Инфраструктура: postgres + redis в Docker (уже проброшены на 5432 и 6379).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for p in 3008 3000 3001 3002 8081 8080; do fuser -k "${p}/tcp" 2>/dev/null || true; done

if ! sudo docker compose ps postgres redis 2>/dev/null | grep -q "Up"; then
  sudo docker compose up -d postgres redis
  echo "Ожидание postgres..."
  for i in $(seq 1 30); do
    sudo docker exec postgres pg_isready -U admin -d crypto_exchange 2>/dev/null && break
    sleep 1
  done
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://admin:password@127.0.0.1:5432/crypto_exchange}"
export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
INTERNAL_KEY="${INTERNAL_API_KEY:-dev-internal-wallet-key-change-in-production}"
JWT="${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}"

# --- Wallet (до user: регистрация дергает wallet internal) ---
mkdir -p /tmp/logs
nohup env NODE_ENV=development PORT=3002 DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" \
  INTERNAL_API_KEY="$INTERNAL_KEY" \
  sh -c 'cd "'"$ROOT"'/wallet-service" && exec npm run start:dev' > /tmp/logs/wallet.log 2>&1 &
sleep 3

# --- User ---
nohup env NODE_ENV=development PORT=3001 DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" \
  JWT_SECRET="$JWT" JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-24h}" \
  WALLET_SERVICE_URL="http://127.0.0.1:3002" INTERNAL_API_KEY="$INTERNAL_KEY" \
  KAFKA_BROKERS="localhost:9092" \
  sh -c 'cd "'"$ROOT"'/user-service" && exec npm run start:dev' > /tmp/logs/user.log 2>&1 &
sleep 5

# --- Order book + gateway ---
nohup env REDIS_URL="$REDIS_URL" PORT=8081 \
  sh -c 'cd "'"$ROOT"'/order-book-service" && exec go run .' > /tmp/logs/order-book.log 2>&1 &
sleep 2

nohup env NODE_ENV=development PORT=3000 DATABASE_URL="$DATABASE_URL" REDIS_URL="$REDIS_URL" \
  USER_SERVICE_URL="http://127.0.0.1:3001" WALLET_SERVICE_URL="http://127.0.0.1:3002" \
  ORDER_BOOK_SERVICE_URL="http://127.0.0.1:8081" INTERNAL_API_KEY="$INTERNAL_KEY" \
  JWT_SECRET="$JWT" JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-24h}" \
  TRADING_ENGINE_URL="${TRADING_ENGINE_URL:-http://127.0.0.1:8080}" \
  MARKET_MAKER_SERVICE_URL="${MARKET_MAKER_SERVICE_URL:-http://127.0.0.1:3007}" \
  ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:3008,http://127.0.0.1:3008}" \
  sh -c 'cd "'"$ROOT"'/api-gateway" && exec npm run start:dev' > /tmp/logs/gateway.log 2>&1 &
sleep 4

nohup env NEXT_PUBLIC_API_URL="http://127.0.0.1:3000" \
  sh -c 'cd "'"$ROOT"'/frontend" && exec pnpm dev --port 3008 -H 0.0.0.0' > /tmp/logs/frontend.log 2>&1 &

sleep 3
echo "--- Health ---"
curl -s http://127.0.0.1:3000/health | head -c 120 || true; echo
curl -s http://127.0.0.1:3001/api/v1/health | head -c 200 || true; echo
curl -s http://127.0.0.1:3002/api/v1/health | head -c 200 || true; echo
curl -s http://127.0.0.1:8081/health | head -c 120 || true; echo
echo "Frontend: http://127.0.0.1:3008/login"
echo "Логи: /tmp/logs/*.log"
