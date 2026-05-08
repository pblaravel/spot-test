import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  TRADE = 'trade',
  FEE = 'fee',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

@Entity({ name: 'transactions', schema: 'wallets' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'type',
  })
  type: TransactionType;

  @Column({
    type: 'varchar',
    length: 20,
    default: TransactionStatus.PENDING,
    name: 'status',
  })
  status: TransactionStatus;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  fee: number;

  @Column()
  currency: string;

  @Column({ name: 'tx_hash', nullable: true })
  txHash: string;

  @Column({ name: 'from_address', nullable: true })
  fromAddress: string;

  @Column({ name: 'to_address', nullable: true })
  toAddress: string;

  @Column({ nullable: true })
  memo: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  confirmations: number;

  @Column({ name: 'block_number', nullable: true })
  blockNumber: number;

  @Column({ name: 'order_id', nullable: true })
  orderId: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
