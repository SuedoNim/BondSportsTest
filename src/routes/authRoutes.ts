import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dtos/auth/LoginDto';
import { AuthService } from '../services/AuthService';
import { ValidationError } from '../utils/errors';

export async function authRoutes(
  fastify: FastifyInstance,
  authService: AuthService,
) {
  // Login route
  fastify.post<{ Body: LoginDto }>(
    '/auth/login',
    {
      schema: {
        description: 'User login',
        tags: ['Authentication'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              token: { type: 'string' },
              payload: {
                type: 'object',
                properties: {
                  personId: { type: 'number' },
                  email: { type: 'string' },
                  roleId: { type: 'number' },
                },
              },
            },
          },
          400: {
            description: 'Invalid credentials',
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) => {
      try {
        const dto = plainToInstance(LoginDto, request.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
          throw new ValidationError('Invalid request data', errors);
        }

        const response = await authService.login(dto);
        reply.code(200).send(response);
      } catch (error) {
        throw error;
      }
    },
  );
}