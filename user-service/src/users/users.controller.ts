import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService, CreateUserDto, LoginDto } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Headers('authorization') authHeader: string) {
    // In a real implementation, you would extract user ID from JWT token
    const userId = 'user-id'; // This should come from JWT
    return this.usersService.getProfile(userId);
  }

  @Put('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() updateData: Partial<CreateUserDto>
  ) {
    const userId = 'user-id'; // This should come from JWT
    return this.usersService.updateProfile(userId, updateData);
  }

  @Put('change-password')
  async changePassword(
    @Headers('authorization') authHeader: string,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    const userId = 'user-id'; // This should come from JWT
    return this.usersService.changePassword(userId, body.oldPassword, body.newPassword);
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.usersService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.usersService.logout(token);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.usersService.verifyEmail(body.token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.usersService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.usersService.resetPassword(body.token, body.newPassword);
  }

  @Get()
  async getUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Headers('authorization') authHeader: string
  ) {
    return this.usersService.getUsers(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  async getUserById(@Param('id') userId: string) {
    return this.usersService.getUserById(userId);
  }

  @Put(':id/deactivate')
  async deactivateUser(@Param('id') userId: string) {
    return this.usersService.deactivateUser(userId);
  }

  @Put(':id/activate')
  async activateUser(@Param('id') userId: string) {
    return this.usersService.activateUser(userId);
  }
} 