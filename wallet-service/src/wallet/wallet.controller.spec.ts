import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CreateWalletDto, DepositDto, WithdrawalDto, TransferDto } from './wallet.service';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  const mockWalletService = {
    createWallet: jest.fn(),
    getUserWallets: jest.fn(),
    getWallet: jest.fn(),
    deposit: jest.fn(),
    withdraw: jest.fn(),
    transfer: jest.fn(),
    lockBalance: jest.fn(),
    unlockBalance: jest.fn(),
    getTransactionHistory: jest.fn(),
    getTransaction: jest.fn(),
    updateTransactionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createWallet', () => {
    it('should create a wallet successfully', async () => {
      const createWalletDto: CreateWalletDto = {
        userId: 'user123',
        currency: 'BTC',
      };

      const expectedWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 0,
        lockedBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        status: 'ACTIVE',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.createWallet.mockResolvedValue(expectedWallet);

      const result = await controller.createWallet(createWalletDto);

      expect(service.createWallet).toHaveBeenCalledWith(createWalletDto);
      expect(result).toEqual(expectedWallet);
    });
  });

  describe('getUserWallets', () => {
    it('should return all wallets for a user', async () => {
      const userId = 'user123';
      const expectedWallets = [
        {
          id: 'wallet1',
          userId: 'user123',
          currency: 'BTC',
          balance: 1.5,
          lockedBalance: 0,
          totalDeposited: 2.0,
          totalWithdrawn: 0.5,
          status: 'ACTIVE',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          memo: '',
          isActive: true,
          lastActivityAt: new Date(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockWalletService.getUserWallets.mockResolvedValue(expectedWallets);

      const result = await controller.getUserWallets(userId);

      expect(service.getUserWallets).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedWallets);
    });
  });

  describe('getWallet', () => {
    it('should return a specific wallet', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const expectedWallet = {
        id: 'wallet1',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.5,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: 'ACTIVE',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.getWallet.mockResolvedValue(expectedWallet);

      const result = await controller.getWallet(userId, currency);

      expect(service.getWallet).toHaveBeenCalledWith(userId, currency);
      expect(result).toEqual(expectedWallet);
    });
  });

  describe('deposit', () => {
    it('should process a deposit successfully', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const depositDto: DepositDto = {
        amount: 1.0,
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test deposit',
      };

      const expectedTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: 'DEPOSIT',
        status: 'CONFIRMED',
        amount: 1.0,
        fee: 0,
        currency: 'BTC',
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        description: 'Test deposit',
        confirmations: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.deposit.mockResolvedValue(expectedTransaction);

      const result = await controller.deposit(userId, currency, depositDto);

      expect(service.deposit).toHaveBeenCalledWith(userId, currency, depositDto);
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('withdraw', () => {
    it('should process a withdrawal successfully', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const withdrawalDto: WithdrawalDto = {
        amount: 0.5,
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        description: 'Test withdrawal',
      };

      const expectedTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount: 0.5,
        fee: 0.001,
        currency: 'BTC',
        txHash: '',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        description: 'Test withdrawal',
        confirmations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.withdraw.mockResolvedValue(expectedTransaction);

      const result = await controller.withdraw(userId, currency, withdrawalDto);

      expect(service.withdraw).toHaveBeenCalledWith(userId, currency, withdrawalDto);
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('transfer', () => {
    it('should process a transfer successfully', async () => {
      const transferDto: TransferDto = {
        fromUserId: 'user123',
        toUserId: 'user456',
        amount: 0.5,
        currency: 'BTC',
        description: 'Test transfer',
      };

      const expectedResult = {
        fromTransaction: {
          id: 'tx1',
          walletId: 'wallet1',
          userId: 'user123',
          type: 'WITHDRAWAL',
          status: 'CONFIRMED',
          amount: 0.5,
          fee: 0,
          currency: 'BTC',
          txHash: '',
          fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          memo: '',
          description: 'Test transfer',
          confirmations: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        toTransaction: {
          id: 'tx2',
          walletId: 'wallet2',
          userId: 'user456',
          type: 'DEPOSIT',
          status: 'CONFIRMED',
          amount: 0.5,
          fee: 0,
          currency: 'BTC',
          txHash: '',
          fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          memo: '',
          description: 'Test transfer',
          confirmations: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      mockWalletService.transfer.mockResolvedValue(expectedResult);

      const result = await controller.transfer(transferDto);

      expect(service.transfer).toHaveBeenCalledWith(transferDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('lockBalance', () => {
    it('should lock balance successfully', async () => {
      const walletId = 'wallet123';
      const amount = 0.5;
      const expectedWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.0,
        lockedBalance: 0.5,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: 'ACTIVE',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.lockBalance.mockResolvedValue(expectedWallet);

      const result = await controller.lockBalance(walletId, { amount });

      expect(service.lockBalance).toHaveBeenCalledWith(walletId, amount);
      expect(result).toEqual(expectedWallet);
    });
  });

  describe('unlockBalance', () => {
    it('should unlock balance successfully', async () => {
      const walletId = 'wallet123';
      const amount = 0.5;
      const expectedWallet = {
        id: 'wallet123',
        userId: 'user123',
        currency: 'BTC',
        balance: 1.5,
        lockedBalance: 0,
        totalDeposited: 2.0,
        totalWithdrawn: 0.5,
        status: 'ACTIVE',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        isActive: true,
        lastActivityAt: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.unlockBalance.mockResolvedValue(expectedWallet);

      const result = await controller.unlockBalance(walletId, { amount });

      expect(service.unlockBalance).toHaveBeenCalledWith(walletId, amount);
      expect(result).toEqual(expectedWallet);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history with default pagination', async () => {
      const userId = 'user123';
      const expectedResult = {
        transactions: [
          {
            id: 'tx1',
            walletId: 'wallet1',
            userId: 'user123',
            type: 'DEPOSIT',
            status: 'CONFIRMED',
            amount: 1.0,
            fee: 0,
            currency: 'BTC',
            txHash: 'tx123',
            fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            memo: '',
            description: 'Test deposit',
            confirmations: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockWalletService.getTransactionHistory.mockResolvedValue(expectedResult);

      const result = await controller.getTransactionHistory(userId);

      expect(service.getTransactionHistory).toHaveBeenCalledWith(userId, undefined, 1, 20);
      expect(result).toEqual(expectedResult);
    });

    it('should return transaction history with custom parameters', async () => {
      const userId = 'user123';
      const currency = 'BTC';
      const page = '2';
      const limit = '10';
      const expectedResult = {
        transactions: [],
        total: 0,
        page: 2,
        limit: 10,
      };

      mockWalletService.getTransactionHistory.mockResolvedValue(expectedResult);

      const result = await controller.getTransactionHistory(userId, currency, page, limit);

      expect(service.getTransactionHistory).toHaveBeenCalledWith(userId, currency, 2, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTransaction', () => {
    it('should return a specific transaction', async () => {
      const transactionId = 'tx123';
      const expectedTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: 'DEPOSIT',
        status: 'CONFIRMED',
        amount: 1.0,
        fee: 0,
        currency: 'BTC',
        txHash: 'tx123',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        description: 'Test deposit',
        confirmations: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.getTransaction.mockResolvedValue(expectedTransaction);

      const result = await controller.getTransaction(transactionId);

      expect(service.getTransaction).toHaveBeenCalledWith(transactionId);
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      const transactionId = 'tx123';
      const updateData = {
        status: 'CONFIRMED',
        txHash: 'newTxHash',
        confirmations: 6,
      };

      const expectedTransaction = {
        id: 'tx123',
        walletId: 'wallet1',
        userId: 'user123',
        type: 'WITHDRAWAL',
        status: 'CONFIRMED',
        amount: 0.5,
        fee: 0.001,
        currency: 'BTC',
        txHash: 'newTxHash',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        memo: '',
        description: 'Test withdrawal',
        confirmations: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockWalletService.updateTransactionStatus.mockResolvedValue(expectedTransaction);

      const result = await controller.updateTransactionStatus(transactionId, updateData);

      expect(service.updateTransactionStatus).toHaveBeenCalledWith(
        transactionId,
        updateData.status,
        updateData.txHash,
        updateData.confirmations,
      );
      expect(result).toEqual(expectedTransaction);
    });
  });
}); 