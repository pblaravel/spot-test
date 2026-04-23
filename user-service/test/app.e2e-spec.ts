import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
// @ts-ignore
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';

describe('UserService (e2e)', () => {
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
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/users/register (POST)', () => {
    it('should create a new user', () => {
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
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.firstName).toBe(createUserDto.firstName);
          expect(res.body.lastName).toBe(createUserDto.lastName);
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/users/register')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/users/login (POST)', () => {
    it('should login user with valid credentials', async () => {
      // First create a user
      const createUserDto = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
      };

      await request(app.getHttpServer())
        .post('/users/register')
        .send(createUserDto);

      // Then try to login
      const loginDto = {
        email: 'login@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should return 400 for invalid credentials', () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/users/login')
        .send(loginDto)
        .expect(400);
    });
  });

  describe('/users/profile (GET)', () => {
    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should return users list with pagination', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
        });
    });
  });

  describe('/users/verify-email (POST)', () => {
    it('should return 400 for invalid token', () => {
      const verifyDto = {
        token: 'invalid-token',
      };

      return request(app.getHttpServer())
        .post('/users/verify-email')
        .send(verifyDto)
        .expect(400);
    });
  });

  describe('/users/forgot-password (POST)', () => {
    it('should return success message', () => {
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/users/forgot-password')
        .send(forgotPasswordDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('/users/reset-password (POST)', () => {
    it('should return 400 for invalid token', () => {
      const resetPasswordDto = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      };

      return request(app.getHttpServer())
        .post('/users/reset-password')
        .send(resetPasswordDto)
        .expect(400);
    });
  });
}); 