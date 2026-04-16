import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Person } from './Person';
import { Transaction } from './Transaction';

@Entity('Account')
export class Account {
  @PrimaryGeneratedColumn()
  accountId!: number;

  @Column({ type: 'integer' })
  personId!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balance!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  daylightWithdrawelLimit?: number;

  @Column({ type: 'boolean' })
  activeFlag!: boolean;

  @Column({ type: 'integer' })
  accountType!: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createDate!: Date;

  @ManyToOne(() => Person, person => person.accounts)
  @JoinColumn({ name: 'personId' })
  person!: Person;

  @OneToMany(() => Transaction, transaction => transaction.account)
  transactions!: Transaction[];
}