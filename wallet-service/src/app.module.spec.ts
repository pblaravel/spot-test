import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet/wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './wallet/entities/wallet.entity';
import { Transaction } from './transactions/entities/transaction.entity';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
}); 