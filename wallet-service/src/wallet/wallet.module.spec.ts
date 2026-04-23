import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

describe('WalletModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: {} },
        { provide: getRepositoryToken(Transaction), useValue: {} },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide WalletService', () => {
    const service = module.get<WalletService>(WalletService);
    expect(service).toBeDefined();
  });

  it('should provide WalletController', () => {
    const controller = module.get<WalletController>(WalletController);
    expect(controller).toBeDefined();
  });
}); 