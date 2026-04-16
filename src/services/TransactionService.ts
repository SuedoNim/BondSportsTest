import { TransactionDao } from '../dao/TransactionDao';
import { AccountDao } from '../dao/AccountDao';
import { Transaction } from '../entities/Transaction';
import { CreateTransactionDto } from '../dtos/transaction/CreateTransactionDto';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
export class TransactionService {
    constructor(
        private transactionDao: TransactionDao,
        private accountDao: AccountDao,
    ) {}
    async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
        logger.debug('Creating transaction', { accountId: dto.accountId, value: dto.value });
        const account = await this.accountDao.findById(dto.accountId);
        if (!account) {
            throw new NotFoundError(`Account with ID ${dto.accountId} not found`);
        }

        if (dto.value <= 0) {
            throw new ValidationError('Transaction value must be greater than zero');
        }

        if (!account.activeFlag) {
            throw new ValidationError('Account is not active');
        }

        const transaction = await this.transactionDao.create({
            accountId: dto.accountId,
            value: dto.value,
        });

        logger.info('Transaction created successfully', { transactionId: transaction.transactionId });
        return transaction;
    }
    async getTransactionById(transactionId: number): Promise<Transaction> {
        const transaction = await this.transactionDao.findById(transactionId, ['account']);
        if (!transaction) {
            throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
        }

        return transaction;
    }
    async getAccountTransactions(accountId: number): Promise<Transaction[]> {
        const account = await this.accountDao.findById(accountId);
        if (!account) {
            throw new NotFoundError("Account with ID ${accountId} not found");
        }
        return this.transactionDao.findByAccountId(accountId);
    }
    async getTransactionsByDateRange(
        accountId: number,
        startDate: Date,
        endDate: Date,
    ): Promise<Transaction[]> {
        return this.transactionDao.findByAccountIdAndDateRange(accountId, startDate, endDate);
    }
    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactionDao.findAll(['account']);
    }
}