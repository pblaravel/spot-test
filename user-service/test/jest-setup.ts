// Global test setup
import 'reflect-metadata';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.WALLET_SERVICE_URL = 'http://localhost:3002';
process.env.INTERNAL_API_KEY = 'test-internal-key'; 