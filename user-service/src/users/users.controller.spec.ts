import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// @ts-ignore
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      verifyEmail: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      deactivateUser: jest.fn(),
      activateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const authHeader = 'Bearer test-token';
      const expectedResult = { id: '1', email: 'test@mail.com' };
      usersService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(authHeader);

      expect(result).toEqual(expectedResult);
      expect(usersService.getProfile).toHaveBeenCalledWith('user-id');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const authHeader = 'Bearer test-token';
      const updateData = { firstName: 'Updated' };
      const expectedResult = { id: '1', firstName: 'Updated' };
      usersService.updateProfile.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(authHeader, updateData);

      expect(result).toEqual(expectedResult);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-id', updateData);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const authHeader = 'Bearer test-token';
      const changePasswordDto = { oldPassword: 'old', newPassword: 'new' };
      const expectedResult = { message: 'Password changed successfully' };
      usersService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(authHeader, changePasswordDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.changePassword).toHaveBeenCalledWith('user-id', 'old', 'new');
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto = { refreshToken: 'refresh' };
      const expectedResult = { accessToken: 'newToken', refreshToken: 'newRefresh' };
      usersService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.refreshToken).toHaveBeenCalledWith('refresh');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const mockRequest = { user: { id: '1' } };
      const expectedResult = { message: 'Logged out successfully' };
      usersService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout('Bearer testtoken');

      expect(result).toEqual(expectedResult);
      expect(usersService.logout).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const verifyEmailDto = { token: 'verificationToken' };
      const expectedResult = { message: 'Email verified successfully' };
      usersService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(verifyEmailDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.verifyEmail).toHaveBeenCalledWith('verificationToken');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email', async () => {
      const forgotPasswordDto = { email: 'test@mail.com' };
      const expectedResult = { message: 'If the email exists, a reset link has been sent' };
      usersService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.forgotPassword).toHaveBeenCalledWith('test@mail.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const resetPasswordDto = { token: 'resetToken', newPassword: 'newPassword' };
      const expectedResult = { message: 'Password reset successfully' };
      usersService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(expectedResult);
      expect(usersService.resetPassword).toHaveBeenCalledWith('resetToken', 'newPassword');
    });
  });

  describe('getUsers', () => {
    it('should get users list with pagination', async () => {
      const page = '1';
      const limit = '10';
      const expectedResult = { users: [], total: 0, page: 1, limit: 10 };
      usersService.getUsers.mockResolvedValue(expectedResult);

      const result = await controller.getUsers(page, limit, '');

      expect(result).toEqual(expectedResult);
      expect(usersService.getUsers).toHaveBeenCalledWith(1, 10);
    });

    it('should use default pagination values', async () => {
      const expectedResult = { users: [], total: 0, page: 1, limit: 10 };
      usersService.getUsers.mockResolvedValue(expectedResult);

      const result = await controller.getUsers(undefined, undefined, '');

      expect(result).toEqual(expectedResult);
      expect(usersService.getUsers).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const expectedResult = { id: '1', email: 'test@mail.com' };
      usersService.getUserById.mockResolvedValue(expectedResult);

      const result = await controller.getUserById('1');

      expect(result).toEqual(expectedResult);
      expect(usersService.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const expectedResult = { message: 'User deactivated successfully' };
      usersService.deactivateUser.mockResolvedValue(expectedResult);

      const result = await controller.deactivateUser('1');

      expect(result).toEqual(expectedResult);
      expect(usersService.deactivateUser).toHaveBeenCalledWith('1');
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const expectedResult = { message: 'User activated successfully' };
      usersService.activateUser.mockResolvedValue(expectedResult);

      const result = await controller.activateUser('1');

      expect(result).toEqual(expectedResult);
      expect(usersService.activateUser).toHaveBeenCalledWith('1');
    });
  });
}); 