# 💰 API Документация - Wallet Service

## 🌐 Базовый URL

- **API Gateway**: `http://localhost:3000/api/v1`
- **Wallet Service (прямо)**: `http://localhost:3002/api/v1`

## 🔐 Аутентификация

Большинство endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### 👛 Управление кошельками

#### 1. Создание кошелька
```http
POST /wallets
```

**Тело запроса:**
```json
{
  "userId": "user-uuid",
  "currency": "BTC"
}
```

**Ответ:**
```json
{
  "id": "wallet-uuid",
  "userId": "user-uuid",
  "currency": "BTC",
  "balance": 0,
  "lockedBalance": 0,
  "totalDeposited": 0,
  "totalWithdrawn": 0,
  "status": "active",
  "address": "btc_abc123def456",
  "memo": null,
  "isActive": true,
  "lastActivityAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Получение всех кошельков пользователя
```http
GET /wallets/user/{userId}
```

**Ответ:**
```json
[
  {
    "id": "wallet-uuid",
    "userId": "user-uuid",
    "currency": "BTC",
    "balance": 1.5,
    "lockedBalance": 0.1,
    "totalDeposited": 2.0,
    "totalWithdrawn": 0.4,
    "status": "active",
    "address": "btc_abc123def456",
    "memo": null,
    "isActive": true,
    "lastActivityAt": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

#### 3. Получение конкретного кошелька
```http
GET /wallets/user/{userId}/currency/{currency}
```

**Ответ:**
```json
{
  "id": "wallet-uuid",
  "userId": "user-uuid",
  "currency": "BTC",
  "balance": 1.5,
  "lockedBalance": 0.1,
  "totalDeposited": 2.0,
  "totalWithdrawn": 0.4,
  "status": "active",
  "address": "btc_abc123def456",
  "memo": null,
  "isActive": true,
  "lastActivityAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 💸 Операции с балансом

#### 4. Пополнение кошелька
```http
POST /wallets/user/{userId}/currency/{currency}/deposit
```

**Тело запроса:**
```json
{
  "amount": 0.5,
  "txHash": "abc123def456",
  "fromAddress": "external-address",
  "memo": "Deposit memo",
  "description": "External deposit"
}
```

**Ответ:**
```json
{
  "id": "transaction-uuid",
  "walletId": "wallet-uuid",
  "userId": "user-uuid",
  "type": "deposit",
  "status": "confirmed",
  "amount": 0.5,
  "fee": 0,
  "currency": "BTC",
  "txHash": "abc123def456",
  "fromAddress": "external-address",
  "toAddress": "btc_abc123def456",
  "memo": "Deposit memo",
  "description": "External deposit",
  "confirmations": 1,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 5. Вывод средств
```http
POST /wallets/user/{userId}/currency/{currency}/withdraw
```

**Тело запроса:**
```json
{
  "amount": 0.1,
  "toAddress": "external-address",
  "memo": "Withdrawal memo",
  "description": "External withdrawal"
}
```

**Ответ:**
```json
{
  "id": "transaction-uuid",
  "walletId": "wallet-uuid",
  "userId": "user-uuid",
  "type": "withdrawal",
  "status": "pending",
  "amount": 0.1,
  "fee": 0.0001,
  "currency": "BTC",
  "txHash": null,
  "fromAddress": "btc_abc123def456",
  "toAddress": "external-address",
  "memo": "Withdrawal memo",
  "description": "External withdrawal",
  "confirmations": 0,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 6. Перевод между пользователями
```http
POST /wallets/transfer
```

**Тело запроса:**
```json
{
  "fromUserId": "user1-uuid",
  "toUserId": "user2-uuid",
  "amount": 0.5,
  "currency": "BTC",
  "description": "Transfer between users"
}
```

**Ответ:**
```json
{
  "fromTransaction": {
    "id": "transaction1-uuid",
    "walletId": "wallet1-uuid",
    "userId": "user1-uuid",
    "type": "transfer",
    "status": "confirmed",
    "amount": -0.5,
    "fee": 0,
    "currency": "BTC",
    "description": "Transfer to user2-uuid",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "toTransaction": {
    "id": "transaction2-uuid",
    "walletId": "wallet2-uuid",
    "userId": "user2-uuid",
    "type": "transfer",
    "status": "confirmed",
    "amount": 0.5,
    "fee": 0,
    "currency": "BTC",
    "description": "Transfer from user1-uuid",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 🔒 Блокировка средств (для торговли)

#### 7. Блокировка средств
```http
PUT /wallets/{walletId}/lock
```

**Тело запроса:**
```json
{
  "amount": 0.1
}
```

**Ответ:**
```json
{
  "id": "wallet-uuid",
  "userId": "user-uuid",
  "currency": "BTC",
  "balance": 1.4,
  "lockedBalance": 0.2,
  "totalDeposited": 2.0,
  "totalWithdrawn": 0.4,
  "status": "active",
  "address": "btc_abc123def456",
  "memo": null,
  "isActive": true,
  "lastActivityAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### 8. Разблокировка средств
```http
PUT /wallets/{walletId}/unlock
```

**Тело запроса:**
```json
{
  "amount": 0.1
}
```

**Ответ:**
```json
{
  "id": "wallet-uuid",
  "userId": "user-uuid",
  "currency": "BTC",
  "balance": 1.5,
  "lockedBalance": 0.1,
  "totalDeposited": 2.0,
  "totalWithdrawn": 0.4,
  "status": "active",
  "address": "btc_abc123def456",
  "memo": null,
  "isActive": true,
  "lastActivityAt": "2024-01-01T12:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 📊 История транзакций

#### 9. Получение истории транзакций
```http
GET /wallets/user/{userId}/transactions?page=1&limit=20&currency=BTC
```

**Параметры запроса:**
- `page` (опционально): номер страницы (по умолчанию: 1)
- `limit` (опционально): количество записей на странице (по умолчанию: 20)
- `currency` (опционально): фильтр по валюте

**Ответ:**
```json
{
  "transactions": [
    {
      "id": "transaction-uuid",
      "walletId": "wallet-uuid",
      "userId": "user-uuid",
      "type": "deposit",
      "status": "confirmed",
      "amount": 0.5,
      "fee": 0,
      "currency": "BTC",
      "txHash": "abc123def456",
      "fromAddress": "external-address",
      "toAddress": "btc_abc123def456",
      "memo": "Deposit memo",
      "description": "External deposit",
      "confirmations": 1,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

#### 10. Получение транзакции по ID
```http
GET /wallets/transactions/{transactionId}
```

**Ответ:**
```json
{
  "id": "transaction-uuid",
  "walletId": "wallet-uuid",
  "userId": "user-uuid",
  "type": "deposit",
  "status": "confirmed",
  "amount": 0.5,
  "fee": 0,
  "currency": "BTC",
  "txHash": "abc123def456",
  "fromAddress": "external-address",
  "toAddress": "btc_abc123def456",
  "memo": "Deposit memo",
  "description": "External deposit",
  "confirmations": 1,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

### 🔧 Административные функции

#### 11. Обновление статуса транзакции
```http
PUT /wallets/transactions/{transactionId}/status
```

**Тело запроса:**
```json
{
  "status": "confirmed",
  "txHash": "abc123def456",
  "confirmations": 6
}
```

**Ответ:**
```json
{
  "id": "transaction-uuid",
  "walletId": "wallet-uuid",
  "userId": "user-uuid",
  "type": "withdrawal",
  "status": "confirmed",
  "amount": 0.1,
  "fee": 0.0001,
  "currency": "BTC",
  "txHash": "abc123def456",
  "fromAddress": "btc_abc123def456",
  "toAddress": "external-address",
  "memo": "Withdrawal memo",
  "description": "External withdrawal",
  "confirmations": 6,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:05:00.000Z"
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

#### Создание кошелька
```bash
curl -X POST http://localhost:3000/api/v1/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "currency": "BTC"
  }'
```

#### Пополнение кошелька
```bash
curl -X POST http://localhost:3000/api/v1/wallets/user/user-uuid/currency/BTC/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.5,
    "txHash": "abc123def456",
    "fromAddress": "external-address",
    "description": "External deposit"
  }'
```

#### Вывод средств
```bash
curl -X POST http://localhost:3000/api/v1/wallets/user/user-uuid/currency/BTC/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.1,
    "toAddress": "external-address",
    "description": "External withdrawal"
  }'
```

#### Получение истории транзакций
```bash
curl -X GET "http://localhost:3000/api/v1/wallets/user/user-uuid/transactions?page=1&limit=10&currency=BTC"
```

### JavaScript (fetch)

#### Создание кошелька
```javascript
const response = await fetch('http://localhost:3000/api/v1/wallets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-uuid',
    currency: 'BTC'
  })
});

const wallet = await response.json();
```

#### Пополнение кошелька
```javascript
const response = await fetch('http://localhost:3000/api/v1/wallets/user/user-uuid/currency/BTC/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 0.5,
    txHash: 'abc123def456',
    fromAddress: 'external-address',
    description: 'External deposit'
  })
});

const transaction = await response.json();
```

#### Получение баланса
```javascript
const response = await fetch('http://localhost:3000/api/v1/wallets/user/user-uuid/currency/BTC');
const wallet = await response.json();
console.log(`Balance: ${wallet.balance} ${wallet.currency}`);
```

## 🔒 Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос (недостаточно средств, неверная валюта) |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Кошелек или транзакция не найдены |
| 409 | Конфликт (кошелек уже существует) |
| 500 | Внутренняя ошибка сервера |

## 💡 Особенности реализации

### Поддерживаемые валюты
- **BTC** - Bitcoin
- **ETH** - Ethereum
- **USDT** - Tether
- **USDC** - USD Coin
- **LTC** - Litecoin
- **XRP** - Ripple
- **ADA** - Cardano
- **DOT** - Polkadot

### Статусы кошельков
- **active** - активный
- **suspended** - приостановлен
- **closed** - закрыт

### Типы транзакций
- **deposit** - пополнение
- **withdrawal** - вывод
- **transfer** - перевод между пользователями
- **trade** - торговая операция
- **fee** - комиссия
- **refund** - возврат

### Статусы транзакций
- **pending** - в обработке
- **confirmed** - подтверждена
- **failed** - неудачна
- **cancelled** - отменена

## 🧪 Тестирование

Для тестирования Wallet API используйте скрипт:
```bash
./test-wallet-api.sh
```

## 📊 Мониторинг

- **Health Check**: `http://localhost:3000/health`
- **Wallet Service Health**: `http://localhost:3002/health`
- **Prometheus метрики**: `http://localhost:9090`
- **Grafana дашборды**: `http://localhost:3006`

## 🔧 Настройка

### Переменные окружения

```env
# База данных
DATABASE_URL=postgresql://admin:password@postgres:5432/crypto_exchange

# Redis
REDIS_URL=redis://redis:6379

# Kafka
KAFKA_BROKERS=kafka:9092
```

### Запуск

```bash
# Запуск всех сервисов
./start.sh

# Только Wallet Service
docker-compose up -d wallet-service postgres redis
``` 