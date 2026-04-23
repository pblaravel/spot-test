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
} from '@nestjs/common';
import { WalletService, CreateWalletDto, DepositDto, WithdrawalDto, TransferDto } from './wallet.service';
import { Wallet } from './entities/wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Создание кошелька
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(createWalletDto);
  }

  // Получение всех кошельков пользователя
  @Get('user/:userId')
  async getUserWallets(@Param('userId') userId: string) {
    return this.walletService.getUserWallets(userId);
  }

  // Получение конкретного кошелька
  @Get('user/:userId/currency/:currency')
  async getWallet(
    @Param('userId') userId: string,
    @Param('currency') currency: string,
  ) {
    return this.walletService.getWallet(userId, currency);
  }

  // Пополнение кошелька
  @Post('user/:userId/currency/:currency/deposit')
  async deposit(
    @Param('userId') userId: string,
    @Param('currency') currency: string,
    @Body() depositDto: DepositDto,
  ) {
    return this.walletService.deposit(userId, currency, depositDto);
  }

  // Вывод средств
  @Post('user/:userId/currency/:currency/withdraw')
  async withdraw(
    @Param('userId') userId: string,
    @Param('currency') currency: string,
    @Body() withdrawalDto: WithdrawalDto,
  ) {
    return this.walletService.withdraw(userId, currency, withdrawalDto);
  }

  // Перевод между пользователями
  @Post('transfer')
  async transfer(@Body() transferDto: TransferDto) {
    return this.walletService.transfer(transferDto);
  }

  // Блокировка средств
  @Put(':walletId/lock')
  async lockBalance(
    @Param('walletId') walletId: string,
    @Body() body: { amount: number },
  ) {
    return this.walletService.lockBalance(walletId, body.amount);
  }

  // Разблокировка средств
  @Put(':walletId/unlock')
  async unlockBalance(
    @Param('walletId') walletId: string,
    @Body() body: { amount: number },
  ) {
    return this.walletService.unlockBalance(walletId, body.amount);
  }

  // История транзакций
  @Get('user/:userId/transactions')
  async getTransactionHistory(
    @Param('userId') userId: string,
    @Query('currency') currency?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.walletService.getTransactionHistory(
      userId,
      currency,
      parseInt(page),
      parseInt(limit),
    );
  }

  // Получение транзакции по ID
  @Get('transactions/:transactionId')
  async getTransaction(@Param('transactionId') transactionId: string) {
    return this.walletService.getTransaction(transactionId);
  }

  // Обновление статуса транзакции (для админов/системы)
  @Put('transactions/:transactionId/status')
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body() body: { 
      status: string; 
      txHash?: string; 
      confirmations?: number 
    },
  ) {
    return this.walletService.updateTransactionStatus(
      transactionId,
      body.status as any,
      body.txHash,
      body.confirmations,
    );
  }
} 