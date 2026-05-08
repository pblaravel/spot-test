import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

@Entity({ name: 'wallets', schema: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  currency: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0, name: 'balance' })
  balance: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0, name: 'locked_balance' })
  lockedBalance: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0, name: 'total_deposited' })
  totalDeposited: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0, name: 'total_withdrawn' })
  totalWithdrawn: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: WalletStatus.ACTIVE,
    name: 'status',
  })
  status: WalletStatus;

  @Column({ nullable: true })
  address: string; // Адрес кошелька для депозитов

  @Column({ nullable: true })
  memo: string; // Мемо для некоторых криптовалют (XRP, XLM и т.д.)

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
