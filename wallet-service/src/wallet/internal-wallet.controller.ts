import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { WalletService, CreateWalletDto } from './wallet.service';

/**
 * Внутренние вызовы между сервисами (без публичного JWT пользователя).
 * Защита общим секретом в заголовке X-Internal-Api-Key.
 */
@Controller('internal/wallets')
export class InternalWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('bootstrap')
  @HttpCode(HttpStatus.CREATED)
  async bootstrapWallet(
    @Headers('x-internal-api-key') apiKey: string,
    @Body() body: CreateWalletDto,
  ) {
    const expected = process.env.INTERNAL_API_KEY;
    if (!expected || apiKey !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }
    return this.walletService.createWallet(body);
  }
}
