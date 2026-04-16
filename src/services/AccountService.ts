import { AccountDao } from '../dao/AccountDao';
import { Account } from '../entities/Account';
import { CreateAccountDto } from '../dtos/account/CreateAccountDto';
import { UpdateAccountDto } from '../dtos/account/UpdateAccountDto';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AccountService {
  constructor(private accountDao: AccountDao) { }

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    logger.debug('Creating account', { personId: dto.personId });

    if (dto.balance < 0 || dto.daylightWithdrawelLimit != null && dto.daylightWithdrawelLimit < 0) {
      throw new ValidationError('Balance and withdrawal limit must be non-negative');
    }

    const account = await this.accountDao.create({
      personId: dto.personId,
      balance: dto.balance,
      daylightWithdrawelLimit: dto.daylightWithdrawelLimit,
      activeFlag: dto.activeFlag,
      accountType: dto.accountType,
    });

    logger.info('Account created successfully', { accountId: account.accountId });
    return account;
  }

  async getAccountById(accountId: number): Promise<Account> {
    const account = await this.accountDao.findById(accountId, ['person', 'transactions']);

    if (!account) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    return account;
  }

  async getAccountsByPersonId(personId: number): Promise<Account[]> {
    return this.accountDao.findByPersonId(personId);
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountDao.findAll(['person']);
  }

  async updateAccount(accountId: number, dto: UpdateAccountDto): Promise<Account> {
    logger.debug('Updating account', { accountId });

    await this.getAccountById(accountId);

    if (dto.balance !== undefined && dto.balance < 0) {
      throw new ValidationError('Balance must be non-negative');
    }

    const updated = await this.accountDao.update(accountId, dto);

    if (!updated) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    logger.info('Account updated successfully', { accountId });
    return updated;
  }

  async deleteAccount(accountId: number): Promise<void> {
    logger.debug('Deleting account', { accountId });

    const exists = await this.accountDao.findById(accountId);
    if (!exists) {
      throw new NotFoundError(`Account with ID ${accountId} not found`);
    }

    await this.accountDao.delete(accountId);
    logger.info('Account deleted successfully', { accountId });
  }

  async updateBalance(accountId: number, amount: number): Promise<Account> {
    const account = await this.getAccountById(accountId);

    const newBalance = parseFloat(account.balance.toString()) + amount;

    if (newBalance < 0) {
      throw new ValidationError('Insufficient balance');
    }

    let updatedAccount = this.accountDao.update(accountId, { balance: newBalance });
    
    return updatedAccount as Promise<Account>;
  }
}