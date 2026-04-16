import { CreatePersonDto } from '../../src/dtos/person/CreatePersonDto';
import { CreateAccountDto } from '../../src/dtos/account/CreateAccountDto';
import { CreateTransactionDto } from '../../src/dtos/transaction/CreateTransactionDto';
import { LoginDto } from '../../src/dtos/auth/LoginDto';
export const testData = {
persons: {
admin: {
name: 'Admin User',
email: 'admin@test.com',
document: 'admin-123',
birthDate: '1990-01-01',
roleId: 1,
password: 'admin123',
} as CreatePersonDto,
regularUser: {
name: 'Regular User',
email: 'user@test.com',
document: 'user-456',
birthDate: '1995-05-15',
roleId: 2,
password: 'user123',
} as CreatePersonDto,
guest: {
name: 'Guest User',
email: 'guest@test.com',
document: 'guest-789',
birthDate: '2000-10-20',
roleId: 3,
password: 'guest123',
} as CreatePersonDto,
},
accounts: {
primary: {
personId: 1,
balance: 5000,
daylightWithdrawelLimit: 2000,
activeFlag: true,
accountType: 1,
} as CreateAccountDto,
secondary: {
personId: 1,
balance: 10000,
daylightWithdrawelLimit: 5000,
activeFlag: true,
accountType: 2,
} as CreateAccountDto,
inactive: {
personId: 2,
balance: 1000,
daylightWithdrawelLimit: 500,
activeFlag: false,
accountType: 1,
} as CreateAccountDto,
},
transactions: {
deposit: {
accountId: 1,
value: 500,
} as CreateTransactionDto,
withdrawal: {
accountId: 1,
value: -200,
} as CreateTransactionDto,
transfer: {
accountId: 1,
value: 1000,
} as CreateTransactionDto,
},
loginCredentials: {
admin: {
email: 'admin@test.com',
password: 'admin123',
} as LoginDto,
user: {
email: 'user@test.com',
password: 'user123',
} as LoginDto,
invalidPassword: {
email: 'admin@test.com',
password: 'wrongpassword',
} as LoginDto,
nonExistentUser: {
email: 'nonexistent@test.com',
password: 'password123',
} as LoginDto,
},
invalidData: {
accountWithNegativeBalance: {
personId: 1,
balance: -1000,
daylightWithdrawelLimit: 500,
activeFlag: true,
accountType: 1,
} as any,
accountWithMissingFields: {
personId: 1,
balance: 5000,
// Missing daylightWithdrawelLimit
} as any,
transactionWithZeroValue: {
accountId: 1,
value: 0,
} as any,
transactionWithInvalidAccount: {
accountId: 99999,
value: 100,
} as any,
personWithInvalidEmail: {
name: 'Test',
email: 'not-an-email',
document: 'test-doc',
birthDate: '1990-01-01',
roleId: 1,
password: 'password123',
} as any,
},
mockResponses: {
successResponse: {
statusCode: 200,
message: 'Success',
},
createdResponse: {
statusCode: 201,
message: 'Created',
},
badRequestResponse: {
statusCode: 400,
error: 'VALIDATION_ERROR',
message: 'Invalid request data',
},
unauthorizedResponse: {
statusCode: 401,
error: 'UNAUTHORIZED',
message: 'Unauthorized',
},
forbiddenResponse: {
statusCode: 403,
error: 'FORBIDDEN',
message: 'Forbidden',
},
notFoundResponse: {
statusCode: 404,
error: 'NOT_FOUND',
message: 'Not found',
},
},
};
export function createMockPerson(overrides?: Partial<CreatePersonDto>): CreatePersonDto {
return {
...testData.persons.regularUser,
...overrides,
};
}
export function createMockAccount(overrides?: Partial<CreateAccountDto>): CreateAccountDto {
return {
...testData.accounts.primary,
...overrides,
};
}
export function createMockTransaction(overrides?: Partial<CreateTransactionDto>): CreateTransactionDto {
return {
...testData.transactions.deposit,
...overrides,
};
}
export function createMockLoginCredentials(overrides?: Partial<LoginDto>): LoginDto {
return {
...testData.loginCredentials.user,
...overrides,
};
}