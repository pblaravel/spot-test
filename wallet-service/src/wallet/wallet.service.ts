import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import * as crypto from 'crypto';

export interface CreateWalletDto {
  userId: string;
  currency: string;
  /** Если задано, кошелёк создаётся с этим балансом и записью о зачислении (демо / бонус при регистрации). */
  initialBalance?: number;
}

export interface DepositDto {
  amount: number;
  txHash?: string;
  fromAddress?: string;
  memo?: string;
  description?: string;
}

export interface WithdrawalDto {
  amount: number;
  toAddress: string;
  memo?: string;
  description?: string;
}

export interface TransferDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface WalletResponse {
  id: string;
  userId: string;
  currency: string;
  balance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  status: WalletStatus;
  address: string;
  memo: string;
  isActive: boolean;
  lastActivityAt: Date;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionResponse {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  currency: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  memo: string;
  description: string;
  confirmations: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // Создание кошелька
  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletResponse> {
    const existingWallet = await this.walletRepository.findOne({
      where: { userId: createWalletDto.userId, currency: createWalletDto.currency },
    });

    if (existingWallet) {
      throw new ConflictException(`Wallet for currency ${createWalletDto.currency} already exists for this user`);
    }

    const initial = createWalletDto.initialBalance ?? 0;
    const { initialBalance: _omit, ...walletFields } = createWalletDto;

    const wallet = this.walletRepository.create({
      ...walletFields,
      address: this.generateWalletAddress(createWalletDto.currency),
      balance: initial,
      lockedBalance: 0,
      totalDeposited: initial,
      totalWithdrawn: 0,
      status: WalletStatus.ACTIVE,
      isActive: true,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    if (initial > 0) {
      const bonusTx = this.transactionRepository.create({
        walletId: savedWallet.id,
        userId: savedWallet.userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        amount: initial,
        fee: 0,
        currency: savedWallet.currency,
        description: 'Registration bonus (demo USDT)',
        confirmations: 1,
      });
      await this.transactionRepository.save(bonusTx);
    }

    return this.mapToWalletResponse(savedWallet);
  }

  // Получение кошелька пользователя
  async getWallet(userId: string, currency: string): Promise<WalletResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency, isActive: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for currency ${currency} not found`);
    }

    return this.mapToWalletResponse(wallet);
  }

  // Получение всех кошельков пользователя
  async getUserWallets(userId: string): Promise<WalletResponse[]> {
    const wallets = await this.walletRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });

    return wallets.map(wallet => this.mapToWalletResponse(wallet));
  }

  // Пополнение кошелька
  async deposit(userId: string, currency: string, depositDto: DepositDto): Promise<TransactionResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency, isActive: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for currency ${currency} not found`);
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Wallet is ${wallet.status}`);
    }

    // Создаем транзакцию
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      userId,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.CONFIRMED, // В реальной системе статус зависит от подтверждений
      amount: depositDto.amount,
      fee: 0,
      currency,
      txHash: depositDto.txHash,
      fromAddress: depositDto.fromAddress,
      toAddress: wallet.address,
      memo: depositDto.memo,
      description: depositDto.description || 'Deposit',
      confirmations: 1,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Обновляем баланс кошелька
    wallet.balance += depositDto.amount;
    wallet.totalDeposited += depositDto.amount;
    wallet.lastActivityAt = new Date();
    await this.walletRepository.save(wallet);

    return this.mapToTransactionResponse(savedTransaction);
  }

  // Вывод средств
  async withdraw(userId: string, currency: string, withdrawalDto: WithdrawalDto): Promise<TransactionResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency, isActive: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet for currency ${currency} not found`);
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException(`Wallet is ${wallet.status}`);
    }

    if (wallet.balance < withdrawalDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Создаем транзакцию
    const transaction = this.transactionRepository.create({
      walletId: wallet.id,
      userId,
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.PENDING,
      amount: withdrawalDto.amount,
      fee: this.calculateWithdrawalFee(currency, withdrawalDto.amount),
      currency,
      fromAddress: wallet.address,
      toAddress: withdrawalDto.toAddress,
      memo: withdrawalDto.memo,
      description: withdrawalDto.description || 'Withdrawal',
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Блокируем средства
    wallet.balance -= withdrawalDto.amount;
    wallet.lockedBalance += withdrawalDto.amount;
    wallet.lastActivityAt = new Date();
    await this.walletRepository.save(wallet);

    return this.mapToTransactionResponse(savedTransaction);
  }

  // Перевод между пользователями
  async transfer(transferDto: TransferDto): Promise<{ fromTransaction: TransactionResponse; toTransaction: TransactionResponse }> {
    const fromWallet = await this.walletRepository.findOne({
      where: { userId: transferDto.fromUserId, currency: transferDto.currency, isActive: true },
    });

    const toWallet = await this.walletRepository.findOne({
      where: { userId: transferDto.toUserId, currency: transferDto.currency, isActive: true },
    });

    if (!fromWallet) {
      throw new NotFoundException(`Source wallet for currency ${transferDto.currency} not found`);
    }

    if (!toWallet) {
      throw new NotFoundException(`Destination wallet for currency ${transferDto.currency} not found`);
    }

    if (fromWallet.balance < transferDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Создаем транзакции для обоих пользователей
    const fromTransaction = this.transactionRepository.create({
      walletId: fromWallet.id,
      userId: transferDto.fromUserId,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.CONFIRMED,
      amount: -transferDto.amount,
      fee: 0,
      currency: transferDto.currency,
      description: transferDto.description || `Transfer to ${transferDto.toUserId}`,
    });

    const toTransaction = this.transactionRepository.create({
      walletId: toWallet.id,
      userId: transferDto.toUserId,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.CONFIRMED,
      amount: transferDto.amount,
      fee: 0,
      currency: transferDto.currency,
      description: transferDto.description || `Transfer from ${transferDto.fromUserId}`,
    });

    const savedFromTransaction = await this.transactionRepository.save(fromTransaction);
    const savedToTransaction = await this.transactionRepository.save(toTransaction);

    // Обновляем балансы
    fromWallet.balance -= transferDto.amount;
    fromWallet.lastActivityAt = new Date();
    await this.walletRepository.save(fromWallet);

    toWallet.balance += transferDto.amount;
    toWallet.lastActivityAt = new Date();
    await this.walletRepository.save(toWallet);

    return {
      fromTransaction: this.mapToTransactionResponse(savedFromTransaction),
      toTransaction: this.mapToTransactionResponse(savedToTransaction),
    };
  }

  // Блокировка средств (для торговли)
  async lockBalance(walletId: string, amount: number): Promise<WalletResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }
    
    wallet.balance -= amount;
    wallet.lockedBalance += amount;
    wallet.lastActivityAt = new Date();
    const savedWallet = await this.walletRepository.save(wallet);
    
    return this.mapToWalletResponse(savedWallet);
  }

  // Разблокировка средств
  async unlockBalance(walletId: string, amount: number): Promise<WalletResponse> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });
    
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    
    if (wallet.lockedBalance < amount) {
      throw new BadRequestException('Insufficient locked balance');
    }
    
    wallet.lockedBalance -= amount;
    wallet.balance += amount;
    wallet.lastActivityAt = new Date();
    const savedWallet = await this.walletRepository.save(wallet);
    
    return this.mapToWalletResponse(savedWallet);
  }

  // Получение истории транзакций
  async getTransactionHistory(
    userId: string,
    currency?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: TransactionResponse[]; total: number; page: number; limit: number }> {
    const query = this.transactionRepository.createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (currency) {
      query.andWhere('transaction.currency = :currency', { currency });
    }

    const [transactions, total] = await query
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      transactions: transactions.map(tx => this.mapToTransactionResponse(tx)),
      total,
      page,
      limit,
    };
  }

  // Получение транзакции по ID
  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapToTransactionResponse(transaction);
  }

  // Обновление статуса транзакции (для обработки блокчейн событий)
  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    txHash?: string,
    confirmations?: number
  ): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    transaction.status = status;
    if (txHash) transaction.txHash = txHash;
    if (confirmations !== undefined) transaction.confirmations = confirmations;

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Если это вывод и статус изменился на CONFIRMED, обновляем баланс
    if (transaction.type === TransactionType.WITHDRAWAL && status === TransactionStatus.CONFIRMED) {
      const wallet = await this.walletRepository.findOne({
        where: { id: transaction.walletId },
      });

      if (wallet) {
        wallet.lockedBalance -= transaction.amount;
        wallet.totalWithdrawn += transaction.amount;
        wallet.lastActivityAt = new Date();
        await this.walletRepository.save(wallet);
      }
    }

    return this.mapToTransactionResponse(savedTransaction);
  }

  // Приватные методы
  private generateWalletAddress(currency: string): string {
    // В реальной системе здесь будет интеграция с блокчейн кошельками
    const prefix = currency.toLowerCase();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  private calculateWithdrawalFee(currency: string, amount: number): number {
    // В реальной системе здесь будет логика расчета комиссий
    const feeRates = {
      'BTC': 0.0001,
      'ETH': 0.001,
      'USDT': 1,
      'USDC': 1,
    };

    return feeRates[currency] || 0;
  }

  private mapToWalletResponse(wallet: Wallet): WalletResponse {
    return {
      id: wallet.id,
      userId: wallet.userId,
      currency: wallet.currency,
      balance: wallet.balance,
      lockedBalance: wallet.lockedBalance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      status: wallet.status,
      address: wallet.address,
      memo: wallet.memo,
      isActive: wallet.isActive,
      lastActivityAt: wallet.lastActivityAt,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  private mapToTransactionResponse(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      userId: transaction.userId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      fee: transaction.fee,
      currency: transaction.currency,
      txHash: transaction.txHash,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      memo: transaction.memo,
      description: transaction.description,
      confirmations: transaction.confirmations,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }
} 