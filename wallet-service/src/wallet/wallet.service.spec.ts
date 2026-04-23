import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletService, CreateWalletDto, DepositDto, WithdrawalDto, TransferDto } from './wallet.service';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/entities/transaction.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: Repository<Wallet>;
  let transactionRepository: Repository<Transaction>;

  const mockWalletRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const createWalletDto: CreateWalletDto = {
        userId: 'user123',
        currency: 'BTC',
      };

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue(mockWallet);

      const result = await service.createWallet(createWalletDto);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { userId: createWalletDto.userId, currency: createWalletDto.currency },
      });
      expect(walletRepository.create).toHaveBeenCalledWith({
        userId: createWalletDto.userId,
        currency: createWalletDto.currency,
        address: expect.any(String),
        balance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: WalletStatus.ACTIVE,
        isActive: true,
      });
      expect(walletRepository.save).toHaveBeenCalledWith(mockWallet);
      expect(result).toHaveProperty('id', 'wallet123');
      expect(result).toHaveProperty('userId', 'user123');
      expect(result).toHaveProperty('currency', 'BTC');
    });

    it('should throw ConflictException if wallet already exists', async () => {
      const createWalletDto: CreateWalletDto = {
        userId: 'user123',
        currency: 'BTC',
      };

      const existingWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
      };

      mockWalletRepository.findOne.mockResolvedValue(existingWallet);

      await expect(service.createWallet(createWalletDto)).rejects.toThrow(
        new ConflictException('Wallet for currency BTC already exists for this user'),
      );
    });
  });

  describe('getWallet', () => {
    it('should return wallet if found', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: 1.5,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getWallet(userId, currency);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { userId, currency, isActive: true },
      });
      expect(result).toHaveProperty('id', 'wallet123');
      expect(result).toHaveProperty('balance', 1.5);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const userId = 'user123';
      const currency = 'BTC';

      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.getWallet(userId, currency)).rejects.toThrow(
        new NotFoundException('Wallet for currency BTC not found'),
      );
    });
  });

  describe('getUserWallets', () => {
    it('should return all wallets for user', async () => {
      const userId = 'user123';
      const mockWallets = [
        {
          id: 'wallet1',
          userId: 'user123',
          currency: 'BTC',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          balance: 1.5,
          lockedBalance: 0,
          totalDeposited: 2.0,
          totalWithdrawn: 0.5,
          status: WalletStatus.ACTIVE,
          isActive: true,
          lastActivityAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'wallet2',
          userId: 'user123',
          currency: 'ETH',
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          balance: 10.0,
          lockedBalance: 0,
          totalDeposited: 15.0,
          totalWithdrawn: 5.0,
          status: WalletStatus.ACTIVE,
          isActive: true,
          lastActivityAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockWalletRepository.find.mockResolvedValue(mockWallets);

      const result = await service.getUserWallets(userId);

      expect(walletRepository.find).toHaveBeenCalledWith({
        where: { userId, isActive: true },
        order: { createdAt: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('currency', 'BTC');
      expect(result[1]).toHaveProperty('currency', 'ETH');
    });
  });

  describe('deposit', () => {
    it('should process deposit successfully', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const depositDto: DepositDto = {
        amount: 1.0,
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test deposit',
      };

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        id: 'tx123',
        walletId: 'wallet123',
        userId: 'user123',
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        amount: 1.0,
        fee: 0,
        currency: 'BTC',
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test deposit',
        confirmations: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockWalletRepository.save.mockResolvedValue({ ...mockWallet, balance: 1.0, totalDeposited: 1.0 });

      const result = await service.deposit(userId, currency, depositDto);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { userId, currency, isActive: true },
      });
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: 'wallet123',
        userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        amount: 1.0,
        fee: 0,
        currency,
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test deposit',
        confirmations: 1,
      });
      expect(result).toHaveProperty('type', 'deposit');
      expect(result).toHaveProperty('amount', 1.0);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const depositDto: DepositDto = {
        amount: 1.0,
      };

      mockWalletRepository.findOne.mockResolvedValue(null);

      await expect(service.deposit(userId, currency, depositDto)).rejects.toThrow(
        new NotFoundException('Wallet for currency BTC not found'),
      );
    });

    it('should throw BadRequestException if wallet is not active', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const depositDto: DepositDto = {
        amount: 1.0,
      };

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        status: WalletStatus.SUSPENDED,
        isActive: true,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(service.deposit(userId, currency, depositDto)).rejects.toThrow(
        new BadRequestException('Wallet is suspended'),
      );
    });
  });

  describe('withdraw', () => {
    it('should process withdrawal successfully', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const withdrawalDto: WithdrawalDto = {
        amount: 0.5,
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test withdrawal',
      };

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        balance: 1.0,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = {
        id: 'tx123',
        walletId: 'wallet123',
        userId: 'user123',
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: 0.5,
        fee: 0.0001,
        currency: 'BTC',
        txHash: '',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test withdrawal',
        confirmations: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);
      mockWalletRepository.save.mockResolvedValue({ ...mockWallet, balance: 0.5, totalWithdrawn: 1.0 });

      const result = await service.withdraw(userId, currency, withdrawalDto);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { userId, currency, isActive: true },
      });
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: 'wallet123',
        userId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: 0.5,
        fee: 0.0001,
        currency,
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test withdrawal',
      });
      expect(result).toHaveProperty('type', 'withdrawal');
      expect(result).toHaveProperty('amount', 0.5);
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const withdrawalDto: WithdrawalDto = {
        amount: 2.0,
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      };

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.0,
        status: WalletStatus.ACTIVE,
        isActive: true,
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(service.withdraw(userId, currency, withdrawalDto)).rejects.toThrow(
        new BadRequestException('Insufficient balance'),
      );
    });
  });

  describe('transfer', () => {
    it('should process transfer successfully', async () => {
      const transferDto: TransferDto = {
        fromUserId: 'user123',
        toUserId: 'user456',
        amount: 0.5,
        currency: 'BTC',
        description: 'Test transfer',
      };

      const fromWallet = {
        id: 'wallet1',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.0,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const toWallet = {
        id: 'wallet2',
        userId: 'user456',
        currency: 'BTC',
        balance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fromTransaction = {
        id: 'tx1',
        walletId: 'wallet1',
        userId: 'user123',
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.CONFIRMED,
        amount: 0.5,
        fee: 0,
        currency: 'BTC',
        txHash: '',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test transfer',
        confirmations: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const toTransaction = {
        id: 'tx2',
        walletId: 'wallet2',
        userId: 'user456',
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        amount: 0.5,
        fee: 0,
        currency: 'BTC',
        txHash: '',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test transfer',
        confirmations: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);

      mockTransactionRepository.create
        .mockReturnValueOnce(fromTransaction)
        .mockReturnValueOnce(toTransaction);

      mockTransactionRepository.save
        .mockResolvedValueOnce(fromTransaction)
        .mockResolvedValueOnce(toTransaction);

      mockWalletRepository.save
        .mockResolvedValueOnce({ ...fromWallet, balance: 0.5, totalWithdrawn: 1.0 })
        .mockResolvedValueOnce({ ...toWallet, balance: 0.5, totalDeposited: 0.5 });

      const result = await service.transfer(transferDto);

      expect(result).toHaveProperty('fromTransaction');
      expect(result).toHaveProperty('toTransaction');
      expect(result.fromTransaction).toHaveProperty('type', 'withdrawal');
      expect(result.toTransaction).toHaveProperty('type', 'deposit');
    });
  });

  describe('lockBalance', () => {
    it('should lock balance successfully', async () => {
      const walletId = 'wallet123';
      const amount = 0.5;

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.0,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue({ ...mockWallet, lockedBalance: 0.5 });

      const result = await service.lockBalance(walletId, amount);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: walletId },
      });
      expect(walletRepository.save).toHaveBeenCalledWith({
        ...mockWallet,
        lockedBalance: 0.5,
        lastActivityAt: expect.any(Date),
      });
      expect(result).toHaveProperty('lockedBalance', 0.5);
    });
  });

  describe('unlockBalance', () => {
    it('should unlock balance successfully', async () => {
      const walletId = 'wallet123';
      const amount = 0.5;

      const mockWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.0,
        lockedBalance: 0.5,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: WalletStatus.ACTIVE,
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockWalletRepository.save.mockResolvedValue({ ...mockWallet, lockedBalance: 0 });

      const result = await service.unlockBalance(walletId, amount);

      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: walletId },
      });
      expect(walletRepository.save).toHaveBeenCalledWith({
        ...mockWallet,
        lockedBalance: 0,
        lastActivityAt: expect.any(Date),
      });
      expect(result).toHaveProperty('lockedBalance', 0);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history with pagination', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const page = 1;
      const limit = 20;

      const mockTransactions = [
        {
          id: 'tx1',
          walletId: 'wallet1',
          userId: 'user123',
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.CONFIRMED,
          amount: 1.0,
          fee: 0,
          currency: 'BTC',
          txHash: 'tx123',
          fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          memo: undefined,
          description: 'Test deposit',
          confirmations: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getCount: jest.fn(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTransactions, 1]),
      };

      mockTransactionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTransactionHistory(userId, currency, page, limit);

      expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
    });
  });

  describe('getTransaction', () => {
    it('should return transaction if found', async () => {
      const transactionId = 'tx123';
      const mockTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.CONFIRMED,
        amount: 1.0,
        fee: 0,
        currency: 'BTC',
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test deposit',
        confirmations: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.getTransaction(transactionId);

      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(result).toHaveProperty('id', 'tx123');
    });

    it('should throw NotFoundException if transaction not found', async () => {
      const transactionId = 'tx123';

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.getTransaction(transactionId)).rejects.toThrow(
        new NotFoundException('Transaction not found'),
      );
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      const transactionId = 'tx123';
      const status = TransactionStatus.CONFIRMED;
      const txHash = 'newTxHash';
      const confirmations = 6;

      const mockTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: 0.5,
        fee: 0.001,
        currency: 'BTC',
        txHash: '',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: undefined,
        description: 'Test withdrawal',
        confirmations: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTransactionRepository.findOne.mockResolvedValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.CONFIRMED,
        txHash: 'newTxHash',
        confirmations: 6,
      });

      const result = await service.updateTransactionStatus(transactionId, status, txHash, confirmations);

      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: transactionId },
      });
      expect(transactionRepository.save).toHaveBeenCalledWith({
        ...mockTransaction,
        status: TransactionStatus.CONFIRMED,
        txHash: 'newTxHash',
        confirmations: 6,
        updatedAt: expect.any(Date),
      });
      expect(result).toHaveProperty('status', 'confirmed');
      expect(result).toHaveProperty('txHash', 'newTxHash');
      expect(result).toHaveProperty('confirmations', 6);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      const transactionId = 'tx123';
      const status = TransactionStatus.CONFIRMED;

      mockTransactionRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTransactionStatus(transactionId, status)).rejects.toThrow(
        new NotFoundException('Transaction not found'),
      );
    });
  });
}); 