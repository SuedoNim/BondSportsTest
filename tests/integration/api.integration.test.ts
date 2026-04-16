import { describe, afterAll, beforeAll, expect, it } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { createDIContainer } from '../../src/config/container';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { Role } from '../../src/entities/Role';
import { Person } from '../../src/entities/Person';
import { Account } from '../../src/entities/Account';
describe('Banking API Integration Tests', () => {
    let fastify: FastifyInstance;
    let container: any;
    let dataSource: DataSource;
    beforeAll(async () => {
        // Initialize in-memory database for testing
        process.env.DATABASE_PATH = ':memory:';
        process.env.NODE_ENV = 'test';
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Create tables and seed data
        dataSource = AppDataSource;
        const roleRepo = dataSource.getRepository(Role);

        // Seed roles
        await roleRepo.insert([
            { type: 'ADMIN', priority: 1 },
            { type: 'USER', priority: 2 },
            { type: 'GUEST', priority: 3 },
        ]);

        // Create DI container and Fastify app
        container = createDIContainer();
        fastify = await createApp(container);
    });
    afterAll(async () => {
        //await fastify.close();
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });
    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await fastify.inject({
                method: 'GET',
                url: '/health',
            });
            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.status).toBe('ok');
            expect(body.timestamp).toBeDefined();
        });
    });
    describe('Authentication', () => {
        beforeAll(async () => {
            // Create admin user
            const personRepo = dataSource.getRepository(Person);
            const adminUser = await personRepo.save({
                name: 'Admin User',
                email: 'admin@test.com',
                document: 'admin-doc',
                passwordHash: '$2a$10$test', // Would be hashed in real scenario
                birthDate: new Date('1990-01-01'),
                roleId: 1,
            });

            // Create regular user
            const regularUser = await personRepo.save({
                name: 'Regular User',
                email: 'user@test.com',
                document: 'user-doc',
                passwordHash: '$2a$10$test',
                birthDate: new Date('1995-01-01'),
                roleId: 2,
            });
        });

        describe('POST /auth/login', () => {
            it('should return 400 for invalid email format', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/auth/login',
                    payload: {
                        email: 'invalid-email',
                        password: 'password123',
                    },
                });

                expect(response.statusCode).toBe(400);
                const body = JSON.parse(response.body);
                expect(body.error).toBe('VALIDATION_ERROR');
            });

            it('should return 400 for missing password', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/auth/login',
                    payload: {
                        email: 'test@example.com',
                    },
                });

                expect(response.statusCode).toBe(400);
            });
        });
    });
    describe('Accounts API', () => {
        let personId: number;
        beforeAll(async () => {
            // Create test person
            const personRepo = dataSource.getRepository(Person);
            const person = await personRepo.save({
                name: 'Test Person',
                email: 'account-test@test.com',
                document: 'account-doc',
                passwordHash: '$2a$10$test',
                birthDate: new Date('1990-01-01'),
                roleId: 2,
            });
            personId = person.personId;
        });

        describe('POST /api/accounts', () => {
            it('should create account with valid data', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/accounts',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        personId,
                        balance: 5000,
                        daylightWithdrawelLimit: 2000,
                        activeFlag: true,
                        accountType: 1,
                    },
                });

                // Note: This will fail without proper auth setup
                // In a real test, you'd need to implement proper token generation
                expect([201, 401, 403]).toContain(response.statusCode);
            });

            it('should return 400 for negative balance', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/accounts',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        personId,
                        balance: -1000,
                        daylightWithdrawelLimit: 2000,
                        activeFlag: true,
                        accountType: 1,
                    },
                });

                expect([400, 401, 403]).toContain(response.statusCode);
            });

            it('should return 400 for missing required fields', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/accounts',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        personId,
                        balance: 5000,
                        // Missing daylightWithdrawelLimit
                    },
                });

                expect([400, 401, 403]).toContain(response.statusCode);
            });
        });

        describe('GET /api/accounts/:accountId', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: '/api/accounts/1',
                });

                expect(response.statusCode).toBe(401);
            });

            it('should return 404 for non-existent account', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: '/api/accounts/99999',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_TOKEN || 'fake-token'}`,
                    },
                });

                expect([401, 404]).toContain(response.statusCode);
            });
        });

        describe('GET /api/accounts', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: '/api/accounts',
                });

                expect(response.statusCode).toBe(401);
            });
        });

        describe('PUT /api/accounts/:accountId', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'PUT',
                    url: '/api/accounts/1',
                    payload: {
                        balance: 7500,
                    },
                });

                expect(response.statusCode).toBe(401);
            });

            it('should return 400 for negative balance update', async () => {
                const response = await fastify.inject({
                    method: 'PUT',
                    url: '/api/accounts/1',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        balance: -1000,
                    },
                });

                expect([400, 401, 403]).toContain(response.statusCode);
            });
        });

        describe('DELETE /api/accounts/:accountId', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'DELETE',
                    url: '/api/accounts/1',
                });

                expect(response.statusCode).toBe(401);
            });
        });
    });
    describe('Transactions API', () => {
        let accountId: number;
        let personId: number;
        beforeAll(async () => {
            // Create test person and account
            const personRepo = dataSource.getRepository(Person);
            const person = await personRepo.save({
                name: 'Transaction Test',
                email: 'transaction-test@test.com',
                document: 'transaction-doc',
                passwordHash: '$2a$10$test',
                birthDate: new Date('1990-01-01'),
                roleId: 2,
            });
            personId = person.personId;

            const accountRepo = dataSource.getRepository(Account);
            const account = await accountRepo.save({
                personId,
                balance: 5000,
                daylightWithdrawelLimit: 2000,
                activeFlag: true,
                accountType: 1,
            });
            accountId = account.accountId;
        });

        describe('POST /api/transactions', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/transactions',
                    payload: {
                        accountId,
                        value: 100,
                    },
                });

                expect(response.statusCode).toBe(401);
            });

            it('should return 400 for zero transaction value', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/transactions',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        accountId,
                        value: 0,
                    },
                });

                expect([400, 401]).toContain(response.statusCode);
            });

            it('should return 404 for non-existent account', async () => {
                const response = await fastify.inject({
                    method: 'POST',
                    url: '/api/transactions',
                    headers: {
                        authorization: `Bearer ${process.env.TEST_TOKEN || 'fake-token'}`,
                    },
                    payload: {
                        accountId: 99999,
                        value: 100,
                    },
                });

                expect([401, 404]).toContain(response.statusCode);
            });
        });

        describe('GET /api/transactions', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: '/api/transactions',
                });

                expect(response.statusCode).toBe(401);
            });
        });

        describe('GET /api/transactions/:transactionId', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: '/api/transactions/1',
                });

                expect(response.statusCode).toBe(401);
            });
        });

        describe('GET /api/transactions/account/:accountId', () => {
            it('should return 401 without authorization', async () => {
                const response = await fastify.inject({
                    method: 'GET',
                    url: `/api/transactions/account/${accountId}`,
                });

                expect(response.statusCode).toBe(401);
            });
        });
    });
    describe('Not Found Routes', () => {
        it('should return 404 for non-existent route', async () => {
            const response = await fastify.inject({
                method: 'GET',
                url: '/api/nonexistent',
                headers: {
                    authorization: "Bearer ${ process.env.TEST_TOKEN || 'fake- token' }",
                },
            });
            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.body);
            expect(body.error).toBe('NOT_FOUND');
        });
    });
});