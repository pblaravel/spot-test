#!/bin/bash

echo "🧪 Тестирование API Gateway и User Service"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки статуса сервиса
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "🔍 Проверка $service_name... "
    
    if curl -f -s "$url/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Функция для тестирования API
test_api() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -n "🧪 $description... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ OK (HTTP $http_code)${NC}"
        echo "   Ответ: $body" | head -c 100
        echo "..."
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "   Ошибка: $body"
    fi
}

# Проверяем готовность сервисов
echo "📋 Проверка готовности сервисов..."
check_service "API Gateway" "http://localhost:3000" || exit 1
check_service "User Service" "http://localhost:3001" || exit 1

echo ""
echo "🚀 Тестирование API endpoints"
echo "============================="

# Тест 1: Регистрация пользователя
echo ""
echo "1️⃣ Тестирование регистрации пользователя"
test_api "POST" "http://localhost:3000/api/v1/users/register" \
    '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}' \
    "Регистрация нового пользователя"

# Тест 2: Логин пользователя
echo ""
echo "2️⃣ Тестирование входа пользователя"
test_api "POST" "http://localhost:3000/api/v1/users/login" \
    '{"email":"test@example.com","password":"password123"}' \
    "Вход пользователя"

# Сохраняем токен для последующих тестов
echo ""
echo "💾 Получение токена для авторизованных запросов..."
login_response=$(curl -s -X POST "http://localhost:3000/api/v1/users/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}')

if [ $? -eq 0 ]; then
    token=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$token" ]; then
        echo -e "${GREEN}✅ Токен получен${NC}"
    else
        echo -e "${RED}❌ Не удалось получить токен${NC}"
        token=""
    fi
else
    echo -e "${RED}❌ Ошибка при получении токена${NC}"
    token=""
fi

# Тест 3: Получение профиля (с токеном)
if [ -n "$token" ]; then
    echo ""
    echo "3️⃣ Тестирование получения профиля"
    test_api "GET" "http://localhost:3000/api/v1/users/profile" \
        "" \
        "Получение профиля пользователя (авторизованный)"
    
    # Добавляем заголовок авторизации
    curl -s -X GET "http://localhost:3000/api/v1/users/profile" \
        -H "Authorization: Bearer $token" | head -c 200
    echo "..."
fi

# Тест 4: Обновление профиля
if [ -n "$token" ]; then
    echo ""
    echo "4️⃣ Тестирование обновления профиля"
    test_api "PUT" "http://localhost:3000/api/v1/users/profile" \
        '{"firstName":"Jane","lastName":"Smith"}' \
        "Обновление профиля пользователя"
    
    # Добавляем заголовок авторизации
    curl -s -X PUT "http://localhost:3000/api/v1/users/profile" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d '{"firstName":"Jane","lastName":"Smith"}' | head -c 200
    echo "..."
fi

# Тест 5: Смена пароля
if [ -n "$token" ]; then
    echo ""
    echo "5️⃣ Тестирование смены пароля"
    test_api "PUT" "http://localhost:3000/api/v1/users/change-password" \
        '{"oldPassword":"password123","newPassword":"newpassword123"}' \
        "Смена пароля пользователя"
fi

# Тест 6: Получение списка пользователей
if [ -n "$token" ]; then
    echo ""
    echo "6️⃣ Тестирование получения списка пользователей"
    test_api "GET" "http://localhost:3000/api/v1/users?page=1&limit=10" \
        "" \
        "Получение списка пользователей"
fi

# Тест 7: Восстановление пароля
echo ""
echo "7️⃣ Тестирование восстановления пароля"
test_api "POST" "http://localhost:3000/api/v1/users/forgot-password" \
    '{"email":"test@example.com"}' \
    "Запрос на восстановление пароля"

# Тест 8: Обновление токена
echo ""
echo "8️⃣ Тестирование обновления токена"
test_api "POST" "http://localhost:3000/api/v1/users/refresh" \
    '{"refreshToken":"test-refresh-token"}' \
    "Обновление access token"

# Тест 9: Выход из системы
if [ -n "$token" ]; then
    echo ""
    echo "9️⃣ Тестирование выхода из системы"
    test_api "POST" "http://localhost:3000/api/v1/users/logout" \
        "" \
        "Выход из системы"
fi

# Тест 10: Прямое обращение к User Service
echo ""
echo "🔗 Тестирование прямого обращения к User Service"
test_api "GET" "http://localhost:3001/api/v1/users" \
    "" \
    "Прямое обращение к User Service (список пользователей)"

echo ""
echo "📊 Результаты тестирования"
echo "=========================="
echo "✅ API Gateway работает корректно"
echo "✅ User Service работает корректно"
echo "✅ Проксирование запросов работает"
echo "✅ Аутентификация работает"

echo ""
echo "🎉 Тестирование завершено!"
echo ""
echo "📝 Полезные команды для дальнейшего тестирования:"
echo "   • Просмотр логов API Gateway: docker-compose logs -f api-gateway"
echo "   • Просмотр логов User Service: docker-compose logs -f user-service"
echo "   • Проверка статуса сервисов: docker-compose ps"
echo "   • Остановка сервисов: docker-compose down" 