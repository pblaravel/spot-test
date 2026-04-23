# Spot Exchange CCXT Integration

Ваша биржа теперь полностью совместима с CCXT (CryptoCurrency eXchange Trading Library)! Это означает, что другие разработчики могут легко интегрировать ваше API в свои приложения, используя стандартные CCXT методы.

## 🚀 Быстрый старт

### 1. Установка библиотеки

```bash
npm install spot-exchange-ccxt
```

### 2. Базовое использование

```javascript
const SpotExchange = require('spot-exchange-ccxt');

// Создание экземпляра биржи
const exchange = new SpotExchange({
  apiKey: 'your-api-key',
  secret: 'your-secret',
  baseUrl: 'http://localhost:3000' // URL вашего API Gateway
});

// Получение тикера
const ticker = await exchange.fetchTicker('BTC/USDT');
console.log('BTC Price:', ticker.last);

// Получение OHLCV данных
const ohlcv = await exchange.fetchOHLCV('BTC/USDT', '1h', undefined, 100);
console.log('Last 100 candles:', ohlcv);

// Создание ордера
const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.001, 50000);
console.log('Order created:', order.id);
```

## 📋 Доступные методы

### Рыночные данные (публичные)

```javascript
// Получить тикер
const ticker = await exchange.fetchTicker('BTC/USDT');

// Получить OHLCV данные
const ohlcv = await exchange.fetchOHLCV('BTC/USDT', '1h', since, limit);

// Получить стакан заявок
const orderbook = await exchange.fetchOrderBook('BTC/USDT', limit);

// Получить последние сделки
const trades = await exchange.fetchTrades('BTC/USDT', since, limit);

// Получить информацию о рынках
const markets = await exchange.loadMarkets();
```

### Торговые операции (требуют API ключи)

```javascript
// Создать ордер
const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.001, 50000);

// Получить баланс
const balance = await exchange.fetchBalance();

// Получить ордера
const orders = await exchange.fetchOrders('BTC/USDT', since, limit);

// Получить ордер по ID
const order = await exchange.fetchOrder('order-id', 'BTC/USDT');

// Отменить ордер
const result = await exchange.cancelOrder('order-id', 'BTC/USDT');

// Получить мои сделки
const myTrades = await exchange.fetchMyTrades('BTC/USDT', since, limit);
```

## 🔧 Конфигурация

```javascript
const exchange = new SpotExchange({
  apiKey: 'your-api-key',           // API ключ (для торговых операций)
  secret: 'your-secret',            // Секрет (для торговых операций)
  baseUrl: 'http://localhost:3000', // URL вашего API Gateway
  timeout: 30000,                   // Таймаут запросов (мс)
  enableRateLimit: true             // Включить ограничение запросов
});
```

## 📊 Поддерживаемые таймфреймы

- `1m` - 1 минута
- `5m` - 5 минут
- `15m` - 15 минут
- `30m` - 30 минут
- `1h` - 1 час
- `4h` - 4 часа
- `1d` - 1 день
- `1w` - 1 неделя

## 🎯 Примеры использования

### Получение рыночных данных

```javascript
// Получить текущую цену BTC
const ticker = await exchange.fetchTicker('BTC/USDT');
console.log(`BTC Price: $${ticker.last}`);

// Получить последние 100 свечей за час
const candles = await exchange.fetchOHLCV('BTC/USDT', '1h', undefined, 100);
console.log('Last candle:', candles[candles.length - 1]);

// Получить стакан заявок
const orderbook = await exchange.fetchOrderBook('BTC/USDT', 10);
console.log('Best bid:', orderbook.bids[0]);
console.log('Best ask:', orderbook.asks[0]);
```

### Торговые операции

```javascript
// Создать лимитный ордер на покупку
const buyOrder = await exchange.createOrder(
  'BTC/USDT',  // символ
  'limit',     // тип ордера
  'buy',       // сторона
  0.001,       // количество
  50000        // цена
);

// Создать рыночный ордер на продажу
const sellOrder = await exchange.createOrder(
  'BTC/USDT',  // символ
  'market',    // тип ордера
  'sell',      // сторона
  0.001        // количество
);

// Получить баланс
const balance = await exchange.fetchBalance();
console.log('BTC Balance:', balance.BTC?.free || 0);
console.log('USDT Balance:', balance.USDT?.free || 0);
```

### Мониторинг ордеров

```javascript
// Получить все активные ордера
const orders = await exchange.fetchOrders('BTC/USDT');

// Получить конкретный ордер
const order = await exchange.fetchOrder('order-id', 'BTC/USDT');

// Отменить ордер
await exchange.cancelOrder('order-id', 'BTC/USDT');
```

## 🔒 Безопасность

- API ключи передаются через заголовки HTTP
- Все запросы используют HTTPS (в продакшене)
- Поддерживается ограничение запросов (rate limiting)
- Валидация всех входных данных

## 📈 Интеграция с существующими CCXT приложениями

Поскольку ваша биржа полностью совместима с CCXT, разработчики могут легко заменить любую другую биржу на вашу:

```javascript
// Вместо Binance
// const exchange = new ccxt.binance({ apiKey, secret });

// Используйте вашу биржу
const exchange = new SpotExchange({ apiKey, secret, baseUrl });

// Остальной код остается без изменений!
const ticker = await exchange.fetchTicker('BTC/USDT');
const order = await exchange.createOrder('BTC/USDT', 'limit', 'buy', 0.001, 50000);
```

## 🐛 Обработка ошибок

```javascript
try {
  const ticker = await exchange.fetchTicker('BTC/USDT');
} catch (error) {
  console.error('Error:', error.message);
  // Обработка ошибки
}
```

## 📚 Дополнительные ресурсы

- [CCXT Documentation](https://docs.ccxt.com/)
- [API Documentation](http://localhost:3000/docs) (Swagger)
- [GitHub Repository](https://github.com/your-repo/spot-exchange)

## 🤝 Поддержка

Если у вас есть вопросы или проблемы с интеграцией:

1. Проверьте документацию API: `http://localhost:3000/docs`
2. Убедитесь, что API Gateway запущен
3. Проверьте правильность API ключей
4. Обратитесь в поддержку

---

**Удачной торговли! 🚀** 