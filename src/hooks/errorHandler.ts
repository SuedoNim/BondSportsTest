import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ApiError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export async function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: Error | ApiError, request: FastifyRequest, reply: FastifyReply) => {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let errors: any = undefined;

    if (error instanceof ValidationError) {
      statusCode = error.statusCode;
      code = error.code || 'VALIDATION_ERROR';
      message = error.message;
      errors = error.errors;
    } else if (error instanceof ApiError) {
      statusCode = error.statusCode;
      code = error.code || 'API_ERROR';
      message = error.message;
    } else {
      logger.error('Unhandled error', error);
    }

    logger.error('Request failed', {
      method: request.method,
      path: request.url,
      statusCode,
      error: message,
    });

    reply.code(statusCode).send({
      error: code,
      message,
      ...(errors && { errors }),
      statusCode,
      timestamp: new Date().toISOString(),
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    logger.warn('Route not found', {
      method: request.method,
      path: request.url,
    });
    reply.code(404).send({
      error: 'NOT_FOUND',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  });
}