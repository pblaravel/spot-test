import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health check status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('info');
        });
    });
  });

  describe('/users/register (POST)', () => {
    it('should register a new user', () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });

    it('should return 400 for invalid user data', () => {
      const invalidUserDto = {
        email: 'invalid-email',
        password: '123', // too short
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('/users/login (POST)', () => {
    it('should login user and return tokens', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 for invalid credentials', () => {
      const invalidLoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(invalidLoginDto)
        .expect(401);
    });
  });

  describe('/users/profile (GET)', () => {
    it('should return 401 without authorization header', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('should return user profile with valid token', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      const token = loginResponse.body.accessToken;

      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
        });
    });
  });

  describe('/wallets (POST)', () => {
    it('should create a new wallet', () => {
      const createWalletDto = {
        userId: '123',
        currency: 'USD',
      };

      return request(app.getHttpServer())
        .post('/wallets')
        .send(createWalletDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('currency');
        });
    });
  });

  describe('/wallets/user/:userId (GET)', () => {
    it('should get user wallets', () => {
      const userId = '123';

      return request(app.getHttpServer())
        .get(`/wallets/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/wallets/user/:userId/currency/:currency (GET)', () => {
    it('should get specific wallet', () => {
      const userId = '123';
      const currency = 'USD';

      return request(app.getHttpServer())
        .get(`/wallets/user/${userId}/currency/${currency}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('currency');
        });
    });
  });

  describe('/wallets/user/:userId/currency/:currency/deposit (POST)', () => {
    it('should deposit funds to wallet', () => {
      const userId = '123';
      const currency = 'USD';
      const depositDto = {
        amount: 100,
        txHash: 'tx123',
      };

      return request(app.getHttpServer())
        .post(`/wallets/user/${userId}/currency/${currency}/deposit`)
        .send(depositDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionId');
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/wallets/user/:userId/currency/:currency/withdraw (POST)', () => {
    it('should withdraw funds from wallet', () => {
      const userId = '123';
      const currency = 'USD';
      const withdrawalDto = {
        amount: 50,
        address: '0x123',
      };

      return request(app.getHttpServer())
        .post(`/wallets/user/${userId}/currency/${currency}/withdraw`)
        .send(withdrawalDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionId');
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/wallets/transfer (POST)', () => {
    it('should transfer funds between wallets', () => {
      const transferDto = {
        fromUserId: '123',
        toUserId: '456',
        currency: 'USD',
        amount: 100,
      };

      return request(app.getHttpServer())
        .post('/wallets/transfer')
        .send(transferDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionId');
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/wallets/user/:userId/transactions (GET)', () => {
    it('should get transaction history', () => {
      const userId = '123';

      return request(app.getHttpServer())
        .get(`/wallets/user/${userId}/transactions`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactions');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
        });
    });

    it('should get transaction history with currency filter', () => {
      const userId = '123';
      const currency = 'USD';

      return request(app.getHttpServer())
        .get(`/wallets/user/${userId}/transactions?currency=${currency}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactions');
          expect(res.body).toHaveProperty('total');
        });
    });
  });

  describe('/api/users/* (Proxy)', () => {
    it('should proxy user service requests', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });

  describe('/api/trading/* (Proxy)', () => {
    it('should proxy trading engine requests', () => {
      return request(app.getHttpServer())
        .get('/api/trading/orders')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });

  describe('/api/wallet/* (Proxy)', () => {
    it('should proxy wallet service requests', () => {
      return request(app.getHttpServer())
        .get('/api/wallet/balance')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });

  describe('/api/notifications/* (Proxy)', () => {
    it('should proxy notification service requests', () => {
      return request(app.getHttpServer())
        .post('/api/notifications/send')
        .send({ message: 'Test notification' })
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });

  describe('/api/analytics/* (Proxy)', () => {
    it('should proxy analytics service requests', () => {
      return request(app.getHttpServer())
        .get('/api/analytics/metrics')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });

  describe('/api/market-maker/* (Proxy)', () => {
    it('should proxy market maker service requests', () => {
      return request(app.getHttpServer())
        .get('/api/market-maker/spread')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
    });
  });
}); 