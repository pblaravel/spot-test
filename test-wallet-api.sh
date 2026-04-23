#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Базовый URL
BASE_URL="http://localhost:3000/api/v1"
WALLET_SERVICE_URL="http://localhost:3002/api/v1"

# Тестовые данные
USER_ID="test-user-123"
CURRENCY="BTC"
AMOUNT=0.5

echo -e "${BLUE}🧪 Тестирование Wallet API${NC}"
echo "=================================="

# Функция для проверки статуса ответа
check_status() {
    local status=$1
    local expected=$2
    local message=$3
    
    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    else
        echo -e "${RED}❌ $message (ожидалось: $expected, получено: $status)${NC}"
    fi
}

# Функция для выполнения HTTP запроса
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Разделяем ответ и статус код
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "$body"
    echo "$http_code"
}

# 1. Проверка здоровья сервиса
echo -e "\n${YELLOW}1. Проверка здоровья сервиса${NC}"
health_response=$(make_request "GET" "/health")
health_status=$(echo "$health_response" | tail -n1)
health_body=$(echo "$health_response" | head -n -1)

check_status "$health_status" "200" "Health check"

# 2. Создание кошелька
echo -e "\n${YELLOW}2. Создание кошелька${NC}"
create_wallet_data="{\"userId\":\"$USER_ID\",\"currency\":\"$CURRENCY\"}"
wallet_response=$(make_request "POST" "/wallets" "$create_wallet_data")
wallet_status=$(echo "$wallet_response" | tail -n1)
wallet_body=$(echo "$wallet_response" | head -n -1)

check_status "$wallet_status" "201" "Создание кошелька"

if [ "$wallet_status" -eq "201" ]; then
    WALLET_ID=$(echo "$wallet_body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}   Создан кошелек с ID: $WALLET_ID${NC}"
fi

# 3. Получение всех кошельков пользователя
echo -e "\n${YELLOW}3. Получение всех кошельков пользователя${NC}"
wallets_response=$(make_request "GET" "/wallets/user/$USER_ID")
wallets_status=$(echo "$wallets_response" | tail -n1)
wallets_body=$(echo "$wallets_response" | head -n -1)

check_status "$wallets_status" "200" "Получение кошельков пользователя"

# 4. Получение конкретного кошелька
echo -e "\n${YELLOW}4. Получение конкретного кошелька${NC}"
wallet_detail_response=$(make_request "GET" "/wallets/user/$USER_ID/currency/$CURRENCY")
wallet_detail_status=$(echo "$wallet_detail_response" | tail -n1)
wallet_detail_body=$(echo "$wallet_detail_response" | head -n -1)

check_status "$wallet_detail_status" "200" "Получение конкретного кошелька"

# 5. Пополнение кошелька
echo -e "\n${YELLOW}5. Пополнение кошелька${NC}"
deposit_data="{\"amount\":$AMOUNT,\"txHash\":\"test-tx-hash-123\",\"fromAddress\":\"external-address\",\"description\":\"Test deposit\"}"
deposit_response=$(make_request "POST" "/wallets/user/$USER_ID/currency/$CURRENCY/deposit" "$deposit_data")
deposit_status=$(echo "$deposit_response" | tail -n1)
deposit_body=$(echo "$deposit_response" | head -n -1)

check_status "$deposit_status" "200" "Пополнение кошелька"

if [ "$deposit_status" -eq "200" ]; then
    TRANSACTION_ID=$(echo "$deposit_body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}   Создана транзакция с ID: $TRANSACTION_ID${NC}"
fi

# 6. Проверка баланса после пополнения
echo -e "\n${YELLOW}6. Проверка баланса после пополнения${NC}"
balance_response=$(make_request "GET" "/wallets/user/$USER_ID/currency/$CURRENCY")
balance_status=$(echo "$balance_response" | tail -n1)
balance_body=$(echo "$balance_response" | head -n -1)

check_status "$balance_status" "200" "Проверка баланса"

if [ "$balance_status" -eq "200" ]; then
    BALANCE=$(echo "$balance_body" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}   Текущий баланс: $BALANCE $CURRENCY${NC}"
fi

# 7. Блокировка средств
echo -e "\n${YELLOW}7. Блокировка средств${NC}"
lock_data="{\"amount\":0.1}"
lock_response=$(make_request "PUT" "/wallets/$WALLET_ID/lock" "$lock_data")
lock_status=$(echo "$lock_response" | tail -n1)
lock_body=$(echo "$lock_response" | head -n -1)

check_status "$lock_status" "200" "Блокировка средств"

# 8. Вывод средств
echo -e "\n${YELLOW}8. Вывод средств${NC}"
withdraw_data="{\"amount\":0.05,\"toAddress\":\"external-withdraw-address\",\"description\":\"Test withdrawal\"}"
withdraw_response=$(make_request "POST" "/wallets/user/$USER_ID/currency/$CURRENCY/withdraw" "$withdraw_data")
withdraw_status=$(echo "$withdraw_response" | tail -n1)
withdraw_body=$(echo "$withdraw_response" | head -n -1)

check_status "$withdraw_status" "200" "Вывод средств"

if [ "$withdraw_status" -eq "200" ]; then
    WITHDRAWAL_ID=$(echo "$withdraw_body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}   Создана транзакция вывода с ID: $WITHDRAWAL_ID${NC}"
fi

# 9. Получение истории транзакций
echo -e "\n${YELLOW}9. Получение истории транзакций${NC}"
history_response=$(make_request "GET" "/wallets/user/$USER_ID/transactions?page=1&limit=10")
history_status=$(echo "$history_response" | tail -n1)
history_body=$(echo "$history_response" | head -n -1)

check_status "$history_status" "200" "Получение истории транзакций"

# 10. Получение конкретной транзакции
echo -e "\n${YELLOW}10. Получение конкретной транзакции${NC}"
if [ -n "$TRANSACTION_ID" ]; then
    transaction_response=$(make_request "GET" "/wallets/transactions/$TRANSACTION_ID")
    transaction_status=$(echo "$transaction_response" | tail -n1)
    transaction_body=$(echo "$transaction_response" | head -n -1)
    
    check_status "$transaction_status" "200" "Получение транзакции"
fi

# 11. Перевод между пользователями
echo -e "\n${YELLOW}11. Перевод между пользователями${NC}"
transfer_data="{\"fromUserId\":\"$USER_ID\",\"toUserId\":\"test-user-456\",\"amount\":0.1,\"currency\":\"$CURRENCY\",\"description\":\"Test transfer\"}"
transfer_response=$(make_request "POST" "/wallets/transfer" "$transfer_data")
transfer_status=$(echo "$transfer_response" | tail -n1)
transfer_body=$(echo "$transfer_response" | head -n -1)

check_status "$transfer_status" "200" "Перевод между пользователями"

# 12. Обновление статуса транзакции (админ функция)
echo -e "\n${YELLOW}12. Обновление статуса транзакции${NC}"
if [ -n "$WITHDRAWAL_ID" ]; then
    status_data="{\"status\":\"confirmed\",\"txHash\":\"confirmed-tx-hash\",\"confirmations\":6}"
    status_response=$(make_request "PUT" "/wallets/transactions/$WITHDRAWAL_ID/status" "$status_data")
    status_status=$(echo "$status_response" | tail -n1)
    status_body=$(echo "$status_response" | head -n -1)
    
    check_status "$status_status" "200" "Обновление статуса транзакции"
fi

# 13. Тестирование ошибок
echo -e "\n${YELLOW}13. Тестирование ошибок${NC}"

# Попытка создать кошелек с той же валютой
echo "   Попытка создать дублирующий кошелек..."
duplicate_response=$(make_request "POST" "/wallets" "$create_wallet_data")
duplicate_status=$(echo "$duplicate_response" | tail -n1)
check_status "$duplicate_status" "409" "Дублирующий кошелек (ожидается конфликт)"

# Попытка вывести больше средств, чем есть
echo "   Попытка вывести больше средств, чем есть..."
excess_withdraw_data="{\"amount\":1000,\"toAddress\":\"external-address\",\"description\":\"Excess withdrawal\"}"
excess_response=$(make_request "POST" "/wallets/user/$USER_ID/currency/$CURRENCY/withdraw" "$excess_withdraw_data")
excess_status=$(echo "$excess_response" | tail -n1)
check_status "$excess_status" "400" "Вывод избыточных средств (ожидается ошибка)"

# Попытка получить несуществующий кошелек
echo "   Попытка получить несуществующий кошелек..."
not_found_response=$(make_request "GET" "/wallets/user/nonexistent/currency/ETH")
not_found_status=$(echo "$not_found_response" | tail -n1)
check_status "$not_found_status" "404" "Несуществующий кошелек (ожидается 404)"

echo -e "\n${BLUE}🎉 Тестирование завершено!${NC}"
echo "=================================="

# Вывод итоговой статистики
echo -e "\n${GREEN}📊 Итоговая статистика:${NC}"
echo "• Создан кошелек: $WALLET_ID"
echo "• Пополнение: $AMOUNT $CURRENCY"
echo "• Текущий баланс: $BALANCE $CURRENCY"
echo "• Количество транзакций: $(echo "$history_body" | grep -o '"total":[0-9]*' | cut -d':' -f2)"

echo -e "\n${BLUE}🔗 Полезные ссылки:${NC}"
echo "• API Gateway: $BASE_URL"
echo "• Wallet Service: $WALLET_SERVICE_URL"
echo "• Health Check: $BASE_URL/health"
echo "• Документация: WALLET_API_DOCUMENTATION.md" 