import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginDto, LoginResponse, UsersService, CreateUserDto } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import * as crypto from 'crypto';

const REGISTRATION_BONUS_USDT = 1000;

/**
 * Service for authentication and registration logic.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
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
  async registerUser(createUserDto: CreateUserDto): Promise<LoginResponse> {
    const existingUser = await this.usersService.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const userResponse = await this.usersService.createUser(createUserDto);
    try {
      await this.grantRegistrationUsdtWallet(userResponse.id);
    } catch (err) {
      this.logger.error(`USDT wallet bootstrap failed for user ${userResponse.id}`, err as Error);
      await this.usersService.removeUser(userResponse.id);
      throw new ServiceUnavailableException('Could not create demo USDT wallet. Please try again later.');
    }
    const accessToken = this.jwtService.sign({
      sub: userResponse.id,
      email: userResponse.email,
    });
    const refreshToken = this.generateRefreshToken();
    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  private async grantRegistrationUsdtWallet(userId: string): Promise<void> {
    const baseUrl = process.env.WALLET_SERVICE_URL?.replace(/\/$/, '');
    const internalKey = process.env.INTERNAL_API_KEY;
    if (!baseUrl || !internalKey) {
      throw new Error('WALLET_SERVICE_URL or INTERNAL_API_KEY is not configured');
    }
    const url = `${baseUrl}/api/v1/internal/wallets/bootstrap`;
    await firstValueFrom(
      this.httpService.post(
        url,
        {
          userId,
          currency: 'USDT',
          initialBalance: REGISTRATION_BONUS_USDT,
        },
        {
          headers: { 'X-Internal-Api-Key': internalKey },
          timeout: 8000,
        },
      ),
    );
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }
} 