# 📚 API Документация - User Service

## 🌐 Базовый URL

- **API Gateway**: `http://localhost:3000/api/v1`
- **User Service (прямо)**: `http://localhost:3001/api/v1`

## 🔐 Аутентификация

Большинство endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### 👤 Управление пользователями

#### 1. Регистрация пользователя
```http
POST /users/register
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Вход пользователя
```http
POST /users/login
```

**Тело запроса:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### 3. Получение профиля
```http
GET /users/profile
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4. Обновление профиля
```http
PUT /users/profile
Authorization: Bearer <jwt-token>
```

**Тело запроса:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 5. Смена пароля
```http
PUT /users/change-password
Authorization: Bearer <jwt-token>
```

**Тело запроса:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Ответ:**
```json
{
  "message": "Password changed successfully"
}
```

### 🔄 Управление токенами

#### 6. Обновление токена
```http
POST /users/refresh
```

**Тело запроса:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Ответ:**
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### 7. Выход из системы
```http
POST /users/logout
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "message": "Logged out successfully"
}
```

### 📧 Управление email

#### 8. Подтверждение email
```http
POST /users/verify-email
```

**Тело запроса:**
```json
{
  "token": "verification-token"
}
```

**Ответ:**
```json
{
  "message": "Email verified successfully"
}
```

#### 9. Запрос на восстановление пароля
```http
POST /users/forgot-password
```

**Тело запроса:**
```json
{
  "email": "user@example.com"
}
```

**Ответ:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### 10. Сброс пароля
```http
POST /users/reset-password
```

**Тело запроса:**
```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

**Ответ:**
```json
{
  "message": "Password reset successfully"
}
```

### 👥 Административные функции

#### 11. Получение списка пользователей
```http
GET /users?page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Параметры запроса:**
- `page` (опционально): номер страницы (по умолчанию: 1)
- `limit` (опционально): количество записей на странице (по умолчанию: 10)

**Ответ:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 12. Получение пользователя по ID
```http
GET /users/{userId}
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 13. Деактивация пользователя
```http
PUT /users/{userId}/deactivate
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "message": "User deactivated successfully"
}
```

#### 14. Активация пользователя
```http
PUT /users/{userId}/activate
Authorization: Bearer <jwt-token>
```

**Ответ:**
```json
{
  "message": "User activated successfully"
}
```

## 🏥 Health Check

#### Проверка состояния сервиса
```http
GET /health
```

**Ответ:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

## 📝 Примеры использования

### cURL

#### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Вход пользователя
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Получение профиля (с токеном)
```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript (fetch)

#### Регистрация пользователя
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const user = await response.json();
```

#### Вход пользователя
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const { user, accessToken, refreshToken } = await response.json();
```

#### Получение профиля
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profile = await response.json();
```

## 🔒 Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, email уже существует) |
| 500 | Внутренняя ошибка сервера |

## 🧪 Тестирование

Для тестирования API используйте скрипт:
```bash
./test-api.sh
```

Этот скрипт проверит все основные endpoints и покажет результаты тестирования.

## 📊 Мониторинг

- **Health Check**: `http://localhost:3000/health`
- **User Service Health**: `http://localhost:3001/health`
- **Prometheus метрики**: `http://localhost:9090`
- **Grafana дашборды**: `http://localhost:3006`

## 🔧 Настройка

### Переменные окружения

```env
# База данных
DATABASE_URL=postgresql://admin:password@postgres:5432/crypto_exchange

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092
```

### Запуск

```bash
# Запуск всех сервисов
./start.sh

# Только API Gateway и User Service
docker-compose up -d api-gateway user-service postgres redis
``` 