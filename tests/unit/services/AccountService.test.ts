import { expect, jest } from '@jest/globals';
import { AccountService } from '../../../src/services/AccountService';
import { AccountDao } from '../../../src/dao/AccountDao';
import { CreateAccountDto } from '../../../src/dtos/account/CreateAccountDto';
import { UpdateAccountDto } from '../../../src/dtos/account/UpdateAccountDto';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
import { describe, beforeEach, it } from 'node:test';
describe('AccountService', () => {
  let service: AccountService;
  let dao: jest.Mocked<AccountDao>;
  beforeEach(() => {
    dao = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPersonId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findActiveAccounts: jest.fn(),
    } as any;
    service = new AccountService(dao);
  });
  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const dto: CreateAccountDto = {
        personId: 1,
        balance: 1000,
        daylightWithdrawelLimit: 500,
        activeFlag: true,
        accountType: 1,
      };
      const mockAccount = {
        accountId: 1,
        ...dto,
        createDate: new Date(),
      };

      dao.create.mockResolvedValue(mockAccount as any);

      const result = await service.createAccount(dto);

      expect(result).toEqual(mockAccount);
      expect(dao.create).toHaveBeenCalledWith({
        personId: 1,
        balance: 1000,
        daylightWithdrawelLimit: 500,
        activeFlag: true,
        accountType: 1,
      });
    });

    it('should throw ValidationError for negative balance', async () => {
      const dto: CreateAccountDto = {
        personId: 1,
        balance: -100,
        daylightWithdrawelLimit: 500,
        activeFlag: true,
        accountType: 1,
      };

      await expect(service.createAccount(dto)).rejects.toThrow(ValidationError);
      expect(dao.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for negative withdrawal limit', async () => {
      const dto: CreateAccountDto = {
        personId: 1,
        balance: 1000,
        daylightWithdrawelLimit: -100,
        activeFlag: true,
        accountType: 1,
      };

      await expect(service.createAccount(dto)).rejects.toThrow(ValidationError);
    });
  });
  describe('getAccountById', () => {
    it('should return account when found', async () => {
      const mockAccount = {
        accountId: 1,
        personId: 1,
        balance: 1000,
        daylightWithdrawelLimit: 500,
        activeFlag: true,
        accountType: 1,
        createDate: new Date(),
      };
      dao.findById.mockResolvedValue(mockAccount as any);

      const result = await service.getAccountById(1);

      expect(result).toEqual(mockAccount);
      expect(dao.findById).toHaveBeenCalledWith(1, ['person', 'transactions']);
    });

    it('should throw NotFoundError when account not found', async () => {
      dao.findById.mockResolvedValue(null);

      await expect(service.getAccountById(999)).rejects.toThrow(NotFoundError);
    });
  });
  describe('getAccountsByPersonId', () => {
    it('should return accounts for person', async () => {
      const mockAccounts = [
        {
          accountId: 1,
          personId: 1,
          balance: 1000,
        },
      ];
      dao.findByPersonId.mockResolvedValue(mockAccounts as any);

      const result = await service.getAccountsByPersonId(1);

      expect(result).toEqual(mockAccounts);
      expect(dao.findByPersonId).toHaveBeenCalledWith(1);
    });
  });
  describe('getAllAccounts', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [
        { accountId: 1, personId: 1, balance: 1000 },
        { accountId: 2, personId: 2, balance: 2000 },
      ];
      dao.findAll.mockResolvedValue(mockAccounts as any);

      const result = await service.getAllAccounts();

      expect(result).toEqual(mockAccounts);
      expect(dao.findAll).toHaveBeenCalledWith(['person']);
    });
  });
  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const dto: UpdateAccountDto = {
        balance: 2000,
      };
      const existingAccount = {
        accountId: 1,
        personId: 1,
        balance: 1000,
      };

      const updatedAccount = {
        ...existingAccount,
        balance: 2000,
      };

      dao.findById.mockResolvedValue(existingAccount as any);
      dao.update.mockResolvedValue(updatedAccount as any);

      const result = await service.updateAccount(1, dto);

      expect(result).toEqual(updatedAccount);
      expect(dao.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundError when account not found', async () => {
      dao.findById.mockResolvedValue(null);

      await expect(service.updateAccount(999, {})).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for negative balance', async () => {
      const dto: UpdateAccountDto = {
        balance: -500,
      };

      const existingAccount = {
        accountId: 1,
        personId: 1,
        balance: 1000,
      };

      dao.findById.mockResolvedValue(existingAccount as any);

      await expect(service.updateAccount(1, dto)).rejects.toThrow(ValidationError);
    });
  });
  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      dao.findById.mockResolvedValue({ accountId: 1 } as any);
      dao.delete.mockResolvedValue(true);
      await service.deleteAccount(1);

      expect(dao.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when account not found', async () => {
      dao.findById.mockResolvedValue(null);

      await expect(service.deleteAccount(999)).rejects.toThrow(NotFoundError);
      expect(dao.delete).not.toHaveBeenCalled();
    });
  });
  describe('updateBalance', () => {
    it('should update balance successfully', async () => {
      const existingAccount = {
        accountId: 1,
        balance: 1000,
      };
      const updatedAccount = {
        ...existingAccount,
        balance: 1100,
      };

      dao.findById.mockResolvedValue(existingAccount as any);
      dao.update.mockResolvedValue(updatedAccount as any);

      const result = await service.updateBalance(1, 100);

      expect(result).toEqual(updatedAccount);
    });

    it('should throw ValidationError for insufficient balance', async () => {
      const existingAccount = {
        accountId: 1,
        balance: 50,
      };

      dao.findById.mockResolvedValue(existingAccount as any);

      await expect(service.updateBalance(1, -100)).rejects.toThrow(ValidationError);
    });
  });
});