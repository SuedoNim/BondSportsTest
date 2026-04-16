import { DataSource } from 'typeorm';
import { Account } from '../entities/Account';
import { BaseDao } from './BaseDao';

export class AccountDao extends BaseDao<Account> {
  constructor(dataSource: DataSource) {
    super(dataSource, Account);
  }

  async findByPersonId(personId: number): Promise<Account[]> {
    return this.repository.find({
      where: { personId },
      relations: ['person'],
    });
  }

  async findActiveAccounts(): Promise<Account[]> {
    return this.repository.find({
      where: { activeFlag: true },
      relations: ['person', 'transactions'],
    });
  }

  protected getIdFieldName(): string {
    return 'accountId';
  }
}