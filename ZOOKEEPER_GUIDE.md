# 🐘 ZooKeeper в криптобирже - Руководство

## 📋 Что такое ZooKeeper?

**Apache ZooKeeper** - это распределенная система координации, которая обеспечивает:
- **Синхронизацию** между сервисами
- **Управление конфигурацией** 
- **Обнаружение сервисов**
- **Распределенные блокировки**
- **Координацию лидерства**

## 🏗️ Архитектура ZooKeeper в нашей системе

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ZooKeeper     │    │   ZooKeeper     │    │   ZooKeeper     │
│   Server 1      │    │   Server 2      │    │   Server 3      │
│   (Leader)      │    │   (Follower)    │    │   (Follower)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Applications  │
                    │   (Our Services)│
                    └─────────────────┘
```

## 🔧 Конфигурация в Docker Compose

```yaml
zookeeper:
  image: confluentinc/cp-zookeeper:7.4.0
  container_name: zookeeper
  environment:
    ZOOKEEPER_CLIENT_PORT: 2181
    ZOOKEEPER_TICK_TIME: 2000
    ZOOKEEPER_INIT_LIMIT: 5
    ZOOKEEPER_SYNC_LIMIT: 2
    ZOOKEEPER_4LW_COMMANDS_WHITELIST: "stat,ruok,conf,isro"
  ports:
    - "2181:2181"
  volumes:
    - zookeeper-data:/var/lib/zookeeper/data
    - zookeeper-logs:/var/lib/zookeeper/log
  healthcheck:
    test: ["CMD-SHELL", "echo ruok | nc localhost 2181"]
    interval: 10s
    timeout: 5s
    retries: 5
```

## 🚀 Запуск и проверка

### 1. Запуск ZooKeeper
```bash
# Запуск только ZooKeeper
docker-compose up -d zookeeper

# Запуск ZooKeeper + Kafka
docker-compose up -d zookeeper kafka

# Запуск всей системы
./start.sh
```

### 2. Проверка состояния
```bash
# Проверка здоровья
echo ruok | nc localhost 2181
# Ответ: imok

# Статистика
echo stat | nc localhost 2181

# Конфигурация
echo conf | nc localhost 2181

# Проверка через Docker
docker exec zookeeper echo ruok | nc localhost 2181
```

### 3. Подключение к ZooKeeper CLI
```bash
# Вход в контейнер
docker exec -it zookeeper zkCli.sh

# Основные команды
ls /                    # Просмотр корневых узлов
ls /services           # Просмотр зарегистрированных сервисов
get /services          # Получение данных узла
create /test "data"    # Создание узла
delete /test           # Удаление узла
quit                   # Выход
```

## 📊 Использование в сервисах

### 1. Service Discovery

```typescript
// Регистрация сервиса
import { ZooKeeper } from 'node-zookeeper-client';

const zk = new ZooKeeper('zookeeper:2181');

async function registerService(serviceName: string, host: string, port: number) {
  const servicePath = `/services/${serviceName}/${host}:${port}`;
  await zk.create(servicePath, 
    JSON.stringify({ 
      host, 
      port, 
      timestamp: Date.now(),
      health: 'healthy'
    }),
    ZooKeeper.CreateMode.EPHEMERAL
  );
}

// Обнаружение сервиса
async function discoverService(serviceName: string): Promise<string[]> {
  const services = await zk.getChildren(`/services/${serviceName}`);
  return services.map(service => {
    const data = await zk.getData(`/services/${serviceName}/${service}`);
    return JSON.parse(data.toString());
  });
}
```

### 2. Распределенные блокировки

```typescript
// Блокировка для критических операций
class DistributedLock {
  constructor(private zk: ZooKeeper, private lockPath: string) {}

  async acquire(): Promise<boolean> {
    try {
      await this.zk.create(this.lockPath, '', ZooKeeper.CreateMode.EPHEMERAL);
      return true;
    } catch (error) {
      return false; // Блокировка уже занята
    }
  }

  async release(): Promise<void> {
    try {
      await this.zk.remove(this.lockPath);
    } catch (error) {
      // Игнорируем ошибки при освобождении
    }
  }
}

// Использование в Wallet Service
const lock = new DistributedLock(zk, '/locks/wallet-update');
if (await lock.acquire()) {
  try {
    // Критическая операция с балансом
    await updateBalance(walletId, amount);
  } finally {
    await lock.release();
  }
}
```

### 3. Управление конфигурацией

```typescript
// Загрузка конфигурации
async function loadConfig(configPath: string): Promise<any> {
  const data = await zk.getData(configPath);
  return JSON.parse(data.toString());
}

// Слушатель изменений конфигурации
zk.watch('/config/wallet-service', (event) => {
  console.log('Конфигурация обновлена:', event);
  // Перезагрузка конфигурации
  loadConfig('/config/wallet-service');
});

// Установка конфигурации
async function setConfig(configPath: string, config: any): Promise<void> {
  const data = JSON.stringify(config);
  await zk.setData(configPath, Buffer.from(data));
}
```

## 🔍 Мониторинг ZooKeeper

### 1. Prometheus метрики

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'zookeeper'
    static_configs:
      - targets: ['zookeeper:2181']
    metrics_path: /metrics
    scrape_interval: 30s
```

### 2. Grafana дашборд

```json
{
  "title": "ZooKeeper Metrics",
  "panels": [
    {
      "title": "Active Connections",
      "targets": [
        {
          "expr": "zookeeper_connections",
          "legendFormat": "Connections"
        }
      ]
    },
    {
      "title": "ZooKeeper Requests",
      "targets": [
        {
          "expr": "rate(zookeeper_requests_total[5m])",
          "legendFormat": "Requests/sec"
        }
      ]
    }
  ]
}
```

### 3. Health Checks

```bash
# Проверка через curl
curl -s http://localhost:2181/metrics | grep zookeeper

# Проверка через Docker
docker exec zookeeper echo stat | nc localhost 2181
```

## 🛠️ Управление топиками Kafka

### 1. Создание топиков

```bash
# Создание топика для транзакций
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic wallet-transactions

# Создание топика для торговых событий
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic trading-events

# Создание топика для уведомлений
docker exec kafka kafka-topics --create \
  --bootstrap-server kafka:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic notifications
```

### 2. Просмотр топиков

```bash
# Список всех топиков
docker exec kafka kafka-topics --list --bootstrap-server kafka:9092

# Детали топика
docker exec kafka kafka-topics --describe \
  --bootstrap-server kafka:9092 \
  --topic wallet-transactions
```

### 3. Kafka UI

Откройте http://localhost:8080 для управления топиками через веб-интерфейс.

## 🔒 Безопасность

### 1. Ограничение команд

```yaml
environment:
  ZOOKEEPER_4LW_COMMANDS_WHITELIST: "stat,ruok,conf,isro"
```

### 2. Аутентификация (для продакшена)

```yaml
environment:
  ZOOKEEPER_ALLOW_ANONYMOUS_LOGIN: "false"
  ZOOKEEPER_SASL_ENABLED: "true"
```

## 📈 Производительность

### 1. Настройки для высокой нагрузки

```yaml
environment:
  ZOOKEEPER_TICK_TIME: 2000
  ZOOKEEPER_INIT_LIMIT: 5
  ZOOKEEPER_SYNC_LIMIT: 2
  ZOOKEEPER_MAX_CLIENT_CNXNS: 60
  ZOOKEEPER_AUTOPURGE_SNAP_RETAIN_COUNT: 3
  ZOOKEEPER_AUTOPURGE_PURGE_INTERVAL: 1
```

### 2. Мониторинг производительности

```bash
# Проверка нагрузки
echo mntr | nc localhost 2181

# Статистика запросов
echo stat | nc localhost 2181 | grep "Received\|Sent"
```

## 🚨 Troubleshooting

### 1. Проблемы с подключением

```bash
# Проверка портов
netstat -an | grep 2181

# Проверка логов
docker logs zookeeper

# Перезапуск сервиса
docker-compose restart zookeeper
```

### 2. Проблемы с данными

```bash
# Очистка данных (осторожно!)
docker-compose down
docker volume rm spot_zookeeper-data
docker-compose up -d zookeeper
```

### 3. Проверка кластера

```bash
# Статус кластера
echo stat | nc localhost 2181

# Проверка лидера
echo stat | nc localhost 2181 | grep "Mode"
```

## 📚 Полезные команды

### ZooKeeper CLI
```bash
# Подключение
docker exec -it zookeeper zkCli.sh

# Основные команды
ls /                    # Просмотр узлов
get /path              # Получение данных
set /path "data"       # Установка данных
create /path "data"    # Создание узла
delete /path           # Удаление узла
rmr /path              # Рекурсивное удаление
```

### Kafka с ZooKeeper
```bash
# Создание топика
kafka-topics --create --bootstrap-server kafka:9092 --topic test

# Просмотр топиков
kafka-topics --list --bootstrap-server kafka:9092

# Отправка сообщения
kafka-console-producer --bootstrap-server kafka:9092 --topic test

# Получение сообщений
kafka-console-consumer --bootstrap-server kafka:9092 --topic test --from-beginning
```

## 🎯 Лучшие практики

### 1. Структура данных
```
/services/
  /user-service/
    /host1:3001
    /host2:3001
  /wallet-service/
    /host1:3002
/locks/
  /wallet-update
  /trading-order
/config/
  /wallet-service
  /trading-engine
/health/
  /user-service
  /wallet-service
```

### 2. Обработка ошибок
```typescript
try {
  await zk.create(path, data, ZooKeeper.CreateMode.EPHEMERAL);
} catch (error) {
  if (error.code === 'NODEEXISTS') {
    // Узел уже существует
  } else if (error.code === 'NOAUTH') {
    // Нет прав доступа
  } else {
    // Другие ошибки
    throw error;
  }
}
```

### 3. Мониторинг
- Регулярно проверяйте метрики ZooKeeper
- Настройте алерты на высокую нагрузку
- Мониторьте количество подключений
- Следите за размером данных

## 🔗 Полезные ссылки

- [Официальная документация ZooKeeper](https://zookeeper.apache.org/)
- [Kafka с ZooKeeper](https://kafka.apache.org/documentation/#zk)
- [Node.js клиент для ZooKeeper](https://github.com/alexguan/node-zookeeper-client)
- [Grafana дашборды для ZooKeeper](https://grafana.com/grafana/dashboards/10439)

---

**ZooKeeper** - это основа надежности и координации в нашей микросервисной архитектуре! 🎯 