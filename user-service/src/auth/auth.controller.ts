import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDto, CreateUserDto } from '../users/users.service';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('users/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }
} 