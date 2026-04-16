import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity('Transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  transactionId!: number;

  @Column({ type: 'integer' })
  accountId!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value!: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate!: Date;

  @ManyToOne(() => Account, account => account.transactions)
  @JoinColumn({ name: 'accountId' })
  account!: Account;
}