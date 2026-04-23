import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponse, UsersService, CreateUserDto, UserResponse } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import * as crypto from 'crypto';

/**
 * Service for authentication and registration logic.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Authenticate user and return tokens.
   * @param loginDto Login credentials
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.getUserByEmail(loginDto.email);
    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new BadRequestException('User account is deactivated');
    }
    user.lastLoginAt = new Date();
    await this.usersService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = this.generateRefreshToken();
    return {
      user: this.usersService.mapToUserResponse(user as User),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user.
   * @param createUserDto User registration data
   */
  async registerUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.usersService.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    // Можно добавить дополнительные проверки/валидацию здесь
    const user = await this.usersService.createUser(createUserDto);
    return user;
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
} 