import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
// @ts-ignore
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let jwtService: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a new user if email is unique', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ email: 'test@mail.com', createdAt: new Date(), updatedAt: new Date() });
      userRepository.save.mockResolvedValue({ id: '1', email: 'test@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() });
      const dto = { email: 'test@mail.com', password: '123', firstName: 'A', lastName: 'B' };
      const result = await service.createUser(dto);
      expect(result.email).toBe(dto.email);
      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw ConflictException if user exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: '1', email: 'test@mail.com' });
      await expect(service.createUser({ email: 'test@mail.com', password: '123', firstName: 'A', lastName: 'B' })).rejects.toThrow(ConflictException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { id: '1', email: 'test@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne.mockResolvedValue({ id: '1', email: 'test@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() });
      const result = await service.getProfile('1');
      expect(result.email).toBe(user.email);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getProfile('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = { id: '1', email: 'test@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, firstName: 'Updated', createdAt: new Date(), updatedAt: new Date() });
      const result = await service.updateProfile('1', { firstName: 'Updated' });
      expect(result.firstName).toBe('Updated');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.updateProfile('999', { firstName: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const user: any = { id: '1', validatePassword: jest.fn(), firstName: 'A', lastName: 'B', createdAt: new Date(), updatedAt: new Date() };
      user.validatePassword.mockResolvedValue(true);
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);
      const result = await service.changePassword('1', 'oldPass', 'newPass');
      expect(result.message).toBe('Password changed successfully');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.changePassword('999', 'oldPass', 'newPass')).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequestException for invalid old password', async () => {
      const user: any = { id: '1', validatePassword: jest.fn(), firstName: 'A', lastName: 'B', createdAt: new Date(), updatedAt: new Date() };
      user.validatePassword.mockResolvedValue(false);
      userRepository.findOne.mockResolvedValue(user);
      await expect(service.changePassword('1', 'wrongPass', 'newPass')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should generate new access and refresh tokens', async () => {
      jwtService.sign.mockReturnValue('newToken');
      const result = await service.refreshToken('oldRefreshToken');
      expect(result.accessToken).toBe('newToken');
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should return logout message', async () => {
      const result = await service.logout('token');
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const user = { id: '1', emailVerificationToken: 'validToken', isEmailVerified: false };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, isEmailVerified: true, emailVerificationToken: null });
      const result = await service.verifyEmail('validToken');
      expect(result.message).toBe('Email verified successfully');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw BadRequestException for invalid token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.verifyEmail('invalidToken')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email if user exists', async () => {
      const user = { id: '1', email: 'test@mail.com' };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);
      const result = await service.forgotPassword('test@mail.com');
      expect(result.message).toBe('If the email exists, a reset link has been sent');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should return same message even if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.forgotPassword('nonexistent@mail.com');
      expect(result.message).toBe('If the email exists, a reset link has been sent');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = { id: '1', passwordResetToken: 'validToken', passwordResetExpires: new Date(Date.now() + 3600000) };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, passwordResetToken: null, passwordResetExpires: null });
      const result = await service.resetPassword('validToken', 'newPassword');
      expect(result.message).toBe('Password reset successfully');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw BadRequestException for invalid token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.resetPassword('invalidToken', 'newPassword')).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException for expired token', async () => {
      const user = { id: '1', passwordResetToken: 'expiredToken', passwordResetExpires: new Date(Date.now() - 3600000) };
      userRepository.findOne.mockResolvedValue(user);
      await expect(service.resetPassword('expiredToken', 'newPassword')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users list', async () => {
      const users = [
        { id: '1', email: 'user1@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', email: 'user2@mail.com', firstName: 'C', lastName: 'D', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() }
      ];
      userRepository.findAndCount.mockResolvedValue([[{ id: '1', email: 'user1@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() }, { id: '2', email: 'user2@mail.com', firstName: 'C', lastName: 'D', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() }], 2]);
      const result = await service.getUsers(1, 10);
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: '1', email: 'test@mail.com', firstName: 'A', lastName: 'B', isActive: true, isEmailVerified: false, createdAt: new Date(), updatedAt: new Date() };
      userRepository.findOne.mockResolvedValue(user);
      const result = await service.getUserById('1');
      expect(result.email).toBe(user.email);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.getUserById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const user = { id: '1', isActive: true };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, isActive: false });
      const result = await service.deactivateUser('1');
      expect(result.message).toBe('User deactivated successfully');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.deactivateUser('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const user = { id: '1', isActive: false };
      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, isActive: true });
      const result = await service.activateUser('1');
      expect(result.message).toBe('User activated successfully');
      expect(userRepository.save).toHaveBeenCalled();
    });
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.activateUser('999')).rejects.toThrow(NotFoundException);
    });
  });
}); 