// Global test setup for e2e tests
import { ConfigService } from '@nestjs/config';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.USER_SERVICE_URL = 'http://localhost:3001';
process.env.TRADING_ENGINE_URL = 'http://localhost:3002';
process.env.WALLET_SERVICE_URL = 'http://localhost:3003';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3004';
process.env.ANALYTICS_SERVICE_URL = 'http://localhost:3005';
process.env.MARKET_MAKER_SERVICE_URL = 'http://localhost:3006';
process.env.ORDER_BOOK_SERVICE_URL = 'http://localhost:8081';

// Increase timeout for e2e tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  createTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  }),
  
  createTestWallet: () => ({
    userId: 'test-user-id',
    currency: 'USD',
  }),
  
  createTestTransaction: () => ({
    amount: 100,
    txHash: `tx-${Date.now()}`,
  }),
}; 