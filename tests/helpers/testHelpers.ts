import { FastifyInstance } from 'fastify';
import { expect } from '@jest/globals';
export class ApiTestHelper {
    constructor(private app: FastifyInstance) { }
    async login(email: string, password: string) {
        const response = await this.app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email, password },
        });
        if (response.statusCode !== 200) {
            throw new Error(`Login failed: ${response.statusCode}`);
        }

        const body = JSON.parse(response.body);
        return body.token;
    }
    async createAccount(accountData: any, token: string) {
        return this.app.inject({
            method: 'POST',
            url: '/api/accounts',
            headers: { authorization: 'Bearer ${token}' },
            payload: accountData,
        });
    }
    async getAccount(accountId: number, token: string) {
        return this.app.inject({
            method: 'GET',
            url: '/api/accounts/${accountId}',
            headers: { authorization: 'Bearer ${token}' },
        });
    }
    async updateAccount(accountId: number, accountData: any, token: string) {
        return this.app.inject({
            method: 'PUT',
            url: '/api/accounts/${accountId}',
            headers: { authorization: 'Bearer ${token}' },
            payload: accountData,
        });
    }
    async deleteAccount(accountId: number, token: string) {
        return this.app.inject({
            method: 'DELETE',
            url: '/api/accounts/${accountId}',
            headers: { authorization: 'Bearer ${token}' }
        });
    }
    async createTransaction(transactionData: any, token: string) {
        return this.app.inject({
            method: 'POST',
            url: '/api/transactions',
            headers: { authorization: 'Bearer ${token}' },
            payload: transactionData,
        });
    }
    async getTransaction(transactionId: number, token: string) {
        return this.app.inject({
            method: 'GET',
            url: '/api/transactions/${transactionId}',
            headers: { authorization: 'Bearer ${token}' },
        });
    }
    async getAccountTransactions(accountId: number, token: string) {
        return this.app.inject({
            method: 'GET',
            url: '/api/transactions/account/${accountId}',
            headers: { authorization: 'Bearer ${token}' },
        });
    }
    async getAllTransactions(token: string) {
        return this.app.inject({
            method: 'GET',
            url: '/api/transactions',
            headers: { authorization: 'Bearer ${token}' },
        });
    }
    parseResponse(response: any) {
        try {
            return JSON.parse(response.body);
        } catch {
            return response.body;
        }
    }
}
export function expectSuccess(statusCode: number) {
    expect([200, 201]).toContain(statusCode);
}
export function expectError(statusCode: number, expectedCode?: string) {
    expect([400, 401, 403, 404, 500]).toContain(statusCode);
}
export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
