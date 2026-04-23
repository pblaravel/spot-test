import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

// Global test setup
beforeAll(async () => {
  // Setup any global test configuration
});

afterAll(async () => {
  // Cleanup any global test resources
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/wallet_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Mock getRepositoryToken only
jest.mock('@nestjs/typeorm', () => {
  const actual = jest.requireActual('@nestjs/typeorm');
  return {
    ...actual,
    getRepositoryToken: actual.getRepositoryToken,
    TypeOrmModule: {
      forRoot: jest.fn().mockReturnValue({
        module: class MockTypeOrmModule {},
        providers: [],
      }),
      forFeature: jest.fn().mockReturnValue({
        module: class MockTypeOrmFeatureModule {},
        providers: [],
      }),
    },
  };
});

// Global test utilities
export const createTestingModule = async (imports: any[] = []) => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      ...imports,
    ],
  });
};

// Mock repositories for testing
export const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  })),
}); 