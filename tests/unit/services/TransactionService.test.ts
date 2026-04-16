import { describe, it, beforeEach, expect, jest} from '@jest/globals';
import { TransactionService } from '../../../src/services/TransactionService';
import { TransactionDao } from '../../../src/dao/TransactionDao';
import { AccountDao } from '../../../src/dao/AccountDao';
import { CreateTransactionDto } from '../../../src/dtos/transaction/CreateTransactionDto';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
describe('TransactionService', () => {
let service: TransactionService;
let transactionDao: jest.Mocked<TransactionDao>;
let accountDao: jest.Mocked<AccountDao>;
beforeEach(() => {
transactionDao = {
create: jest.fn(),
findById: jest.fn(),
findByAccountId: jest.fn(),
findByAccountIdAndDateRange: jest.fn(),
findAll: jest.fn(),
update: jest.fn(),
delete: jest.fn(),
} as any;
accountDao = {
  findById: jest.fn(),
  findByPersonId: jest.fn(),
  findAll: jest.fn(),
  findActiveAccounts: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any;

service = new TransactionService(transactionDao, accountDao);
});
describe('createTransaction', () => {
it('should create transaction successfully', async () => {
const dto: CreateTransactionDto = {
accountId: 1,
value: 100,
};
  const mockAccount = {
    accountId: 1,
    activeFlag: true,
  };

  const mockTransaction = {
    transactionId: 1,
    ...dto,
    transactionDate: new Date(),
  };

  accountDao.findById.mockResolvedValue(mockAccount as any);
  transactionDao.create.mockResolvedValue(mockTransaction as any);

  const result = await service.createTransaction(dto);

  expect(result).toEqual(mockTransaction);
  expect(transactionDao.create).toHaveBeenCalledWith({
    accountId: 1,
    value: 100,
  });
});

it('should throw NotFoundError if account not found', async () => {
  const dto: CreateTransactionDto = {
    accountId: 999,
    value: 100,
  };

  accountDao.findById.mockResolvedValue(null);

  await expect(service.createTransaction(dto)).rejects.toThrow(NotFoundError);
});

it('should throw ValidationError for zero value', async () => {
  const dto: CreateTransactionDto = {
    accountId: 1,
    value: 0,
  };

  const mockAccount = { accountId: 1 };
  accountDao.findById.mockResolvedValue(mockAccount as any);

  await expect(service.createTransaction(dto)).rejects.toThrow(ValidationError);
});

it('should throw ValidationError for inactive account', async () => {
  const dto: CreateTransactionDto = {
    accountId: 1,
    value: 100,
  };

  const mockAccount = {
    accountId: 1,
    activeFlag: false,
  };

  accountDao.findById.mockResolvedValue(mockAccount as any);

  await expect(service.createTransaction(dto)).rejects.toThrow(ValidationError);
});
});
describe('getTransactionById', () => {
it('should return transaction when found', async () => {
const mockTransaction = {
transactionId: 1,
accountId: 1,
value: 100,
};
  transactionDao.findById.mockResolvedValue(mockTransaction as any);

  const result = await service.getTransactionById(1);

  expect(result).toEqual(mockTransaction);
});

it('should throw NotFoundError when transaction not found', async () => {
  transactionDao.findById.mockResolvedValue(null);

  await expect(service.getTransactionById(999)).rejects.toThrow(NotFoundError);
});
});
describe('getAccountTransactions', () => {
it('should return account transactions', async () => {
const mockAccount = { accountId: 1 };
const mockTransactions = [
{ transactionId: 1, accountId: 1, value: 100 },
];
  accountDao.findById.mockResolvedValue(mockAccount as any);
  transactionDao.findByAccountId.mockResolvedValue(mockTransactions as any);

  const result = await service.getAccountTransactions(1);

  expect(result).toEqual(mockTransactions);
});

it('should throw NotFoundError if account not found', async () => {
  accountDao.findById.mockResolvedValue(null);

  await expect(service.getAccountTransactions(999)).rejects.toThrow(NotFoundError);
});
});
describe('getTransactionsByDateRange', () => {
it('should return transactions in date range', async () => {
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
const mockTransactions = [
{ transactionId: 1, accountId: 1, value: 100 },
];
  transactionDao.findByAccountIdAndDateRange.mockResolvedValue(mockTransactions as any);

  const result = await service.getTransactionsByDateRange(1, startDate, endDate);

  expect(result).toEqual(mockTransactions);
  expect(transactionDao.findByAccountIdAndDateRange).toHaveBeenCalledWith(1, startDate, endDate);
});
});
describe('getAllTransactions', () => {
it('should return all transactions', async () => {
const mockTransactions = [
{ transactionId: 1, accountId: 1, value: 100 },
{ transactionId: 2, accountId: 2, value: 200 },
];
  transactionDao.findAll.mockResolvedValue(mockTransactions as any);

  const result = await service.getAllTransactions();

  expect(result).toEqual(mockTransactions);
  expect(transactionDao.findAll).toHaveBeenCalledWith(['account']);
});
});
});