import { CreateAccountDto } from '../../src/dtos/account/CreateAccountDto';
import { CreatePersonDto } from '../../src/dtos/person/CreatePersonDto';
import { CreateTransactionDto } from '../../src/dtos/transaction/CreateTransactionDto';
export class MockFactory {
    static createMockAccount(overrides?: Partial<CreateAccountDto>): CreateAccountDto {
        return {
            personId: 1,
            balance: 5000,
            daylightWithdrawelLimit: 2000,
            activeFlag: true,
            accountType: 1,
            ...overrides,
        };
    }
    static createMockPerson(overrides?: Partial<CreatePersonDto>): CreatePersonDto {
        return {
            name: 'Test User',
            email: 'test@example.com',
            document: 'test-doc-123',
            birthDate: '1990-01-01',
            roleId: 2,
            password: 'password123',
            ...overrides,
        };
    }
    static createMockTransaction(overrides?: Partial<CreateTransactionDto>): CreateTransactionDto {
        return {
            accountId: 1,
            value: 100,
            ...overrides,
        };
    }
    static createMockAccountEntity(overrides?: any) {
        return {
            accountId: 1,
            personId: 1,
            balance: 5000,
            daylightWithdrawelLimit: 2000,
            activeFlag: true,
            accountType: 1,
            createDate: new Date(),
            person: null,
            transactions: [],
            ...overrides,
        };
    }
    static createMockPersonEntity(overrides?: any) {
        return {
            personId: 1,
            name: 'Test User',
            email: 'test@example.com',
            document: 'test-doc-123',
            passwordHash: '2a$10hashed',
            birthDate: new Date('1990-01-01'),
            roleId: 2,
            role: null,
            accounts: [],
            ...overrides,
        };
    }

    static createMockTransactionEntity(overrides?: any) {
        return {
            transactionId: 1,
            accountId: 1,
            value: 100,
            transactionDate: new Date(),
            account: null,
            ...overrides,
        };
    }
    static createMockRoleEntity(overrides?: any) {
        return {
            roleId: 2,
            type: 'USER',
            priority: 2,
            persons: [],
            ...overrides,
        };
    }
}