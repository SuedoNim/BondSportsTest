import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from '../dtos/transaction/CreateTransactionDto';
import { TransactionService } from '../services/TransactionService';
import { AccountService } from '../services/AccountService';
import { ValidationError, ForbiddenError } from '../utils/errors';

// Get Account by ID
export interface AuthRequest extends FastifyRequest {
    user?: {
        personId: number;
        email: string;
        roleId: number;
    };
}
export async function transactionRoutes(
    fastify: FastifyInstance,
    transactionService: TransactionService,
    accountService: AccountService,
    roleCheckFn?: (request: AuthRequest, roles: string[]) => Promise<boolean>,
) {
    fastify.post<{ Body: CreateTransactionDto }>(
        '/api/transactions',
        {
            schema: {
                description: 'Create a new transaction, for either depositing or withdrawing to and from balance',
                tags: ['Transactions'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: AuthRequest, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                const dto = plainToInstance(CreateTransactionDto, request.body);
                const errors = await validate(dto as object);

                if (errors.length > 0) {
                    throw new ValidationError('Invalid request data', errors);
                }

                await accountService.updateBalance(dto.accountId, dto.value);
                const transaction = await transactionService.createTransaction(dto);

                reply.code(201).send(transaction);
            } catch (error) {
                throw error;
            }
        },
    );
    fastify.get(
        '/api/transactions',
        {
            schema: {
                description: 'Get all transactions (Admin only)',
                tags: ['Transactions'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: AuthRequest, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                if (roleCheckFn) {
                    await roleCheckFn(request, ['ADMIN']);
                }

                const transactions = await transactionService.getAllTransactions();
                reply.send(transactions);
            } catch (error) {
                throw error;
            }
        },
    );
    interface TransactionParams {
        transactionId: string;
        accountId: string;
    };

    fastify.get<{ Params: TransactionParams }>(
        '/api/transactions/:transactionId',
        {
            schema: {
                description: 'Get transaction by ID',
                tags: ['Transactions'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: AuthRequest & { params: TransactionParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                const transactionId = parseInt(request.params.transactionId);
                const transaction = await transactionService.getTransactionById(transactionId);
                reply.send(transaction);
            } catch (error) {
                throw error;
            }
        },
    );
    fastify.get<{ Params: TransactionParams }>(
        '/api/transactions/account/:accountId',
        {
            schema: {
                description: 'Get account transactions',
                tags: ['Transactions'],
                security: [{ bearerAuth: [] }],
            },
        },
        async (request: AuthRequest & { params: TransactionParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                const accountId = parseInt(request.params.accountId);
                const transactions = await transactionService.getAccountTransactions(accountId);
                reply.send(transactions);
            } catch (error) {
                throw error;
            }
        },
    );
    
    interface DateRangeParams {
        accountId: string;
        startDate: string;
        endDate: string;
    }

    fastify.get<{ Params: DateRangeParams }>(
        '/api/transactions/account/:accountId/date-range',
        {
            schema: {
                description: 'Get account transactions by date range',
                tags: ['Transactions'],
                security: [{ bearerAuth: [] }],
                params: {
                    type: 'object',
                    required: ['accountId', 'startDate', 'endDate'],
                    properties: {
                        accountId: { type: 'string' },
                        startDate: { type: 'string', format: 'date-time' },
                        endDate: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
        async (request: AuthRequest & { params: DateRangeParams }, reply: FastifyReply) => {
            try {
                if (!request.user) {
                    throw new ForbiddenError('User not authenticated');
                }
                const accountId = parseInt(request.params.accountId);
                const startDate = new Date(request.params.startDate);
                const endDate = new Date(request.params.endDate);
                const transactions = await transactionService.getTransactionsByDateRange(accountId, startDate, endDate);
                reply.send(transactions);
            } catch (error) {
                throw error;
            }
        },
    );
}