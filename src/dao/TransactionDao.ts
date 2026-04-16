import { DataSource } from 'typeorm';
import { Transaction } from '../entities/Transaction';
import { BaseDao } from './BaseDao';
export class TransactionDao extends BaseDao<Transaction> {
    constructor(dataSource: DataSource) {
        super(dataSource, Transaction);
    }
    async findByAccountId(accountId: number): Promise<Transaction[]> {
        return this.repository.find({
            where: { accountId },
            order: { transactionDate: 'DESC' },
        });
    }
    async findByAccountIdAndDateRange(
        accountId: number,
        startDate: Date,
        endDate: Date,
    ): Promise<Transaction[]> {
        return this.repository
            .createQueryBuilder('t')
            .where('t.accountId = :accountId', { accountId })
            .andWhere('t.transactionDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .orderBy('t.transactionDate', 'DESC')
            .getMany();
    }
    protected getIdFieldName(): string {
        return 'transactionId';
    }
}