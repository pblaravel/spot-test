import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  currency: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  balance: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  lockedBalance: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  totalDeposited: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  totalWithdrawn: number;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE
  })
  status: WalletStatus;

  @Column({ nullable: true })
  address: string; // Адрес кошелька для депозитов

  @Column({ nullable: true })
  memo: string; // Мемо для некоторых криптовалют (XRP, XLM и т.д.)

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.wallet)
  transactions: Transaction[];
} 