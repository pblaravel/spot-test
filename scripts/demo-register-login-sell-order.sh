#!/usr/bin/env bash
# Регистрация → вход → лимитный ордер на продажу через API Gateway.
# Нужен запущенный стек, в т.ч. wallet-service (регистрация создаёт USDT-кошел > internal bootstrap).
# Пример: docker compose up -d postgres redis zookeeper kafka user-service wallet-service order-book-service api-gateway

set -u

BASE="${BASE_URL:-http://localhost:3000}"
STAMP=$(date +%s)
EMAIL="${DEMO_EMAIL:-demo-${STAMP}@example.com}"
PASS="${DEMO_PASSWORD:-DemoPass123}"

echo "Gateway: $BASE"
echo "Email:   $EMAIL"
echo ""

echo "==> Регистрация"
reg_http=$(curl -sS -o /tmp/demo-reg.json -w "%{http_code}" -X POST "$BASE/api/users/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"firstName\":\"Demo\",\"lastName\":\"User\"}")
cat /tmp/demo-reg.json
echo ""
if [[ "$reg_http" != "200" && "$reg_http" != "201" ]]; then
  echo "Ошибка регистрации (HTTP $reg_http). Убедитесь, что подняты user-service, wallet-service, kafka, postgres, redis." >&2
  exit 1
fi

echo ""
echo "==> Вход"
login_http=$(curl -sS -o /tmp/demo-login.json -w "%{http_code}" -X POST "$BASE/api/users/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
cat /tmp/demo-login.json
echo ""
if [[ "$login_http" != "200" ]]; then
  echo "Ошибка входа (HTTP $login_http)" >&2
  exit 1
fi

TOKEN=$(grep -o '"accessToken":"[^"]*"' /tmp/demo-login.json | head -1 | cut -d'"' -f4)
if [[ -z "${TOKEN}" ]]; then
  echo "Не удалось извлечь accessToken из ответа логина" >&2
  exit 1
fi

echo ""
echo "==> Лимитный ордер на продажу (order-book через gateway)"
sell_http=$(curl -sS -o /tmp/demo-sell.json -w "%{http_code}" -X POST "$BASE/api/exchange/order-book/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"symbol":"BTCUSDT","side":"sell","type":"limit","quantity":"0.01","price":"100000"}')
cat /tmp/demo-sell.json
echo ""
if [[ "$sell_http" != "200" ]]; then
  echo "Ошибка создания ордера (HTTP $sell_http)" >&2
  exit 1
fi

echo ""
echo "Готово. Учётная запись: $EMAIL"
