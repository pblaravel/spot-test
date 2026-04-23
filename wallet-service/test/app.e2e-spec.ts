import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WalletService (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1/wallets (POST) - should create wallet', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets')
      .send({
        userId: 'test-user-123',
        currency: 'BTC',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('userId', 'test-user-123');
        expect(res.body).toHaveProperty('currency', 'BTC');
        expect(res.body).toHaveProperty('balance', 0);
        expect(res.body).toHaveProperty('status', 'ACTIVE');
      });
  });

  it('/api/v1/wallets/user/:userId (GET) - should get user wallets', () => {
    return request(app.getHttpServer())
      .get('/api/v1/wallets/user/test-user-123')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/v1/wallets/user/:userId/currency/:currency (GET) - should get specific wallet', () => {
    return request(app.getHttpServer())
      .get('/api/v1/wallets/user/test-user-123/currency/BTC')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('userId', 'test-user-123');
        expect(res.body).toHaveProperty('currency', 'BTC');
      });
  });

  it('/api/v1/wallets/user/:userId/currency/:currency/deposit (POST) - should process deposit', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets/user/test-user-123/currency/BTC/deposit')
      .send({
        amount: 1.0,
        txHash: 'test-tx-hash',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test deposit',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type', 'DEPOSIT');
        expect(res.body).toHaveProperty('amount', 1.0);
        expect(res.body).toHaveProperty('status', 'CONFIRMED');
      });
  });

  it('/api/v1/wallets/user/:userId/currency/:currency/withdraw (POST) - should process withdrawal', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets/user/test-user-123/currency/BTC/withdraw')
      .send({
        amount: 0.5,
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test withdrawal',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('type', 'WITHDRAWAL');
        expect(res.body).toHaveProperty('amount', 0.5);
        expect(res.body).toHaveProperty('status', 'PENDING');
      });
  });

  it('/api/v1/wallets/transfer (POST) - should process transfer', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets/transfer')
      .send({
        fromUserId: 'test-user-123',
        toUserId: 'test-user-456',
        amount: 0.1,
        currency: 'BTC',
        description: 'Test transfer',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('fromTransaction');
        expect(res.body).toHaveProperty('toTransaction');
        expect(res.body.fromTransaction).toHaveProperty('type', 'WITHDRAWAL');
        expect(res.body.toTransaction).toHaveProperty('type', 'DEPOSIT');
      });
  });

  it('/api/v1/wallets/:walletId/lock (PUT) - should lock balance', () => {
    return request(app.getHttpServer())
      .put('/api/v1/wallets/test-wallet-123/lock')
      .send({
        amount: 0.5,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-wallet-123');
        expect(res.body).toHaveProperty('lockedBalance', 0.5);
      });
  });

  it('/api/v1/wallets/:walletId/unlock (PUT) - should unlock balance', () => {
    return request(app.getHttpServer())
      .put('/api/v1/wallets/test-wallet-123/unlock')
      .send({
        amount: 0.5,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-wallet-123');
        expect(res.body).toHaveProperty('lockedBalance', 0);
      });
  });

  it('/api/v1/wallets/user/:userId/transactions (GET) - should get transaction history', () => {
    return request(app.getHttpServer())
      .get('/api/v1/wallets/user/test-user-123/transactions')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('transactions');
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('limit');
        expect(Array.isArray(res.body.transactions)).toBe(true);
      });
  });

  it('/api/v1/wallets/transactions/:transactionId (GET) - should get specific transaction', () => {
    return request(app.getHttpServer())
      .get('/api/v1/wallets/transactions/test-tx-123')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-tx-123');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('amount');
      });
  });

  it('/api/v1/wallets/transactions/:transactionId/status (PUT) - should update transaction status', () => {
    return request(app.getHttpServer())
      .put('/api/v1/wallets/transactions/test-tx-123/status')
      .send({
        status: 'CONFIRMED',
        txHash: 'new-tx-hash',
        confirmations: 6,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-tx-123');
        expect(res.body).toHaveProperty('status', 'CONFIRMED');
        expect(res.body).toHaveProperty('txHash', 'new-tx-hash');
        expect(res.body).toHaveProperty('confirmations', 6);
      });
  });

  // Error cases
  it('/api/v1/wallets (POST) - should return 409 for duplicate wallet', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets')
      .send({
        userId: 'test-user-123',
        currency: 'BTC',
      })
      .expect(409);
  });

  it('/api/v1/wallets/user/:userId/currency/:currency (GET) - should return 404 for non-existent wallet', () => {
    return request(app.getHttpServer())
      .get('/api/v1/wallets/user/non-existent-user/currency/BTC')
      .expect(404);
  });

  it('/api/v1/wallets/user/:userId/currency/:currency/withdraw (POST) - should return 400 for insufficient balance', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallets/user/test-user-123/currency/BTC/withdraw')
      .send({
        amount: 999999,
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      })
      .expect(400);
  });
}); 