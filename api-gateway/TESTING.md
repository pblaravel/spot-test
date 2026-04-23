# Тестирование API Gateway

Этот документ описывает структуру тестов для API Gateway и инструкции по их запуску.

## Структура тестов

### Unit тесты
- `src/health/health.controller.spec.ts` - тесты для HealthController
- `src/proxy/proxy.controller.spec.ts` - тесты для ProxyController
- `src/proxy/proxy.service.spec.ts` - тесты для ProxyService
- `src/users/users.controller.spec.ts` - тесты для UsersController
- `src/users/users.service.spec.ts` - тесты для UsersService
- `src/users/users.module.spec.ts` - тесты для UsersModule
- `src/wallets/wallets.controller.spec.ts` - тесты для WalletsController
- `src/wallets/wallets.service.spec.ts` - тесты для WalletsService
- `src/wallets/wallets.module.spec.ts` - тесты для WalletsModule
- `src/app.module.spec.ts` - тесты для AppModule

### E2E тесты
- `test/app.e2e-spec.ts` - интеграционные тесты для всего приложения

### Конфигурация
- `test/jest-e2e.json` - конфигурация Jest для e2e тестов
- `test/jest-e2e.setup.ts` - настройка окружения для e2e тестов

## Запуск тестов

### Unit тесты
```bash
# Запуск всех unit тестов
npm test

# Запуск тестов в режиме watch
npm run test:watch

# Запуск тестов с покрытием
npm run test:cov

# Запуск тестов в debug режиме
npm run test:debug
```

### E2E тесты
```bash
# Запуск e2e тестов
npm run test:e2e
```

## Покрытие кода

Для просмотра покрытия кода тестами:

```bash
npm run test:cov
```

Отчет о покрытии будет создан в папке `coverage/`.

## Типы тестов

### 1. Unit тесты
Тестируют отдельные компоненты изолированно:
- **Контроллеры**: Проверяют правильность обработки HTTP запросов
- **Сервисы**: Проверяют бизнес-логику и взаимодействие с внешними сервисами
- **Модули**: Проверяют правильность конфигурации и внедрения зависимостей

### 2. E2E тесты
Тестируют приложение как единое целое:
- Проверяют полный цикл HTTP запросов
- Тестируют интеграцию между компонентами
- Проверяют работу прокси-функциональности

## Моки и стабы

### Axios моки
Для тестирования HTTP клиентов используется мок axios:

```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
```

### Сервис моки
Для изоляции тестов используются моки сервисов:

```typescript
const mockService = {
  method: jest.fn(),
};
```

## Тестовые данные

### Пользователи
```typescript
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
};
```

### Кошельки
```typescript
const testWallet = {
  userId: '123',
  currency: 'USD',
};
```

### Транзакции
```typescript
const testTransaction = {
  amount: 100,
  txHash: 'tx123',
};
```

## Лучшие практики

### 1. Именование тестов
- Используйте описательные имена для тестов
- Группируйте связанные тесты в `describe` блоки
- Используйте паттерн "should" для описания ожидаемого поведения

### 2. Структура тестов
```typescript
describe('ComponentName', () => {
  let component: Component;
  let mockService: MockService;

  beforeEach(async () => {
    // Настройка
  });

  afterEach(() => {
    // Очистка
  });

  describe('methodName', () => {
    it('should do something when condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 3. Обработка ошибок
- Тестируйте как успешные сценарии, так и ошибки
- Проверяйте правильность HTTP статус кодов
- Тестируйте обработку исключений

### 4. Асинхронные тесты
- Используйте `async/await` для асинхронных операций
- Правильно обрабатывайте промисы в тестах
- Используйте `done` callback для сложных асинхронных сценариев

## Отладка тестов

### Debug режим
```bash
npm run test:debug
```

### Логирование
Для отладки можно добавить логирование в тесты:

```typescript
console.log('Test data:', result);
```

### Изоляция тестов
Каждый тест должен быть независимым и не влиять на другие тесты.

## CI/CD интеграция

Тесты автоматически запускаются в CI/CD пайплайне:

1. Установка зависимостей
2. Запуск линтера
3. Запуск unit тестов
4. Запуск e2e тестов
5. Генерация отчета о покрытии

## Мониторинг качества

### Метрики покрытия
- Минимальное покрытие: 80%
- Критический порог: 90%

### Качество кода
- ESLint проверки
- Prettier форматирование
- TypeScript компиляция

## Troubleshooting

### Частые проблемы

1. **Ошибки импорта**: Убедитесь, что все зависимости установлены
2. **Таймауты**: Увеличьте timeout для медленных тестов
3. **Моки**: Проверьте правильность настройки моков
4. **Окружение**: Убедитесь, что переменные окружения настроены правильно

### Полезные команды

```bash
# Очистка кэша Jest
npx jest --clearCache

# Запуск конкретного теста
npx jest --testNamePattern="should create user"

# Запуск тестов с подробным выводом
npx jest --verbose
``` 