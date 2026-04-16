import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateAccountDto } from '../dtos/account/CreateAccountDto';
import { UpdateAccountDto } from '../dtos/account/UpdateAccountDto';
import { AccountService } from '../services/AccountService';
import { ValidationError, ForbiddenError } from '../utils/errors';

export interface AuthRequest extends FastifyRequest {
    user?: {
        personId: number;
        email: string;
        roleId: number;
    };
}

export async function accountRoutes(
    fastify: FastifyInstance,
    accountService: AccountService,
    roleCheckFn?: (request: AuthRequest, roles: string[]) => Promise<boolean>,
) {
    // Create Account (Admin only)
    fastify.post<{ Body: CreateAccountDto }>(
        '/api/accounts',
        {
            schema: {
                description: 'Create a new bank account (Admin only)',
                tags: ['Accounts'],
                security: [{ bearerAuth: [] }],
                body: {
                    type: 'object',
                    required: ['personId', 'balance', 'daylightWithdrawelLimit', 'activeFlag', 'accountType'],
                    properties: {
                        personId: { type: 'number' },
                        balance: { type: 'number', minimum: 0 },
                        daylightWithdrawelLimit: { type: 'number', minimum: 0 },
                        activeFlag: { type: 'boolean' },
                        accountType: { type: 'number' }
                    }
                },
                response: {
                    201: {
                        description: 'Account created',
                        type: 'object',
                        properties: {
                            accountId: { type: 'number' },
                            personId: { type: 'number' },
                            balance: { type: 'number' },
                            daylightWithdrawelLimit: { type: 'number' },
                            activeFlag: { type: 'boolean' },
                            accountType: { type: 'number' },
                            createDate: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            },
        },
        async (request: AuthRequest, reply: FastifyReply) => {
            try {
                // Check authentication
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }

                // Check role
                if (roleCheckFn) {
                    await roleCheckFn(request, ['ADMIN']);
                }

                const dto = plainToInstance(CreateAccountDto, request.body);
                const errors = await validate(dto);

                if (errors.length > 0) {
                    throw new ValidationError('Invalid request data', errors);
                }

                const account = await accountService.createAccount(dto);
                reply.code(201).send(account);
            } catch (error) {
                throw error;
            }
        },
    );

    // Get All Accounts
    fastify.get<{ Querystring: { page?: number; limit?: number } }>(
        '/api/accounts',
        {
            schema: {
                description: 'Get all bank accounts',
                tags: ['Accounts'],
                security: [{ bearerAuth: [] }],
                querystring: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', default: 1 },
                        limit: { type: 'number', default: 10 },
                    },
                },
                response: {
                    200: {
                        description: 'List of accounts',
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                accountId: { type: 'number' },
                                personId: { type: 'number' },
                                balance: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
        async (request: AuthRequest, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }

                const accounts = await accountService.getAllAccounts();
                reply.send(accounts);
            } catch (error) {
                throw error;
            }
        },
    );

    // Get Account by ID
    interface AccountParams {
        accountId: string;
    }

    fastify.get<{ Params: AccountParams }>(
        '/api/accounts/:accountId',
        {
            schema: {
                description: 'Get account by ID',
                tags: ['Accounts'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['accountId'],
                    properties: {
                        accountId: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        description: 'Account details',
                        type: 'object',
                    },
                    404: {
                        description: 'Account not found',
                    },
                },
            },
        },
        async (request: AuthRequest & { params: AccountParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                const accountId = parseInt(request.params.accountId);
                const account = await accountService.getAccountById(accountId);
                reply.send(account);
            } catch (error) {
                throw error;
            }
        },
    );

    // Update Account
    fastify.put<{ Params: AccountParams; Body: UpdateAccountDto }>(
        '/api/accounts/:accountId',
        {
            schema: {
                description: 'Update bank account (Admin only)',
                tags: ['Accounts'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['accountId'],
                    properties: {
                        accountId: { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        balance: { type: 'number', minimum: 0 },
                        daylightWithdrawelLimit: { type: 'number', minimum: 0 },
                        activeFlag: { type: 'boolean' },
                        accountType: { type: 'number' },
                    },
                },
                response: {
                    200: {
                        description: 'Account updated',
                    },
                },
            },
        },
        async (request: AuthRequest & { params: AccountParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }

                if (roleCheckFn) {
                    await roleCheckFn(request, ['ADMIN']);
                }

                const accountId = parseInt(request.params.accountId);
                const dto = plainToInstance(UpdateAccountDto, request.body);
                const errors = await validate(dto);

                if (errors.length > 0) {
                    throw new ValidationError('Invalid request data', errors);
                }

                const account = await accountService.updateAccount(accountId, dto);
                reply.send(account);
            } catch (error) {
                throw error;
            }
        },
    );

    // Delete Account
    fastify.delete<{ Params: AccountParams }>(
        '/api/accounts/:accountId',
        {
            schema: {
                description: 'Delete bank account (Admin only)',
                tags: ['Accounts'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['accountId'],
                    properties: {
                        accountId: { type: 'string' },
                    },
                },
                response: {
                    204: {
                        description: 'Account deleted',
                    },
                },
            },
        },
        async (request: AuthRequest & { params: AccountParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }

                if (roleCheckFn) {
                    await roleCheckFn(request, ['ADMIN']);
                }

                const accountId = parseInt(request.params.accountId);
                await accountService.deleteAccount(accountId);
                reply.code(204).send();
            } catch (error) {
                throw error;
            }
        },
    );
}