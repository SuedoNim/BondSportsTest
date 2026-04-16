import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export interface AuthRequest extends FastifyRequest {
  user?: {
    personId: number;
    email: string;
    roleId: number;
  };
  startTime?: number;
  requestId?: string;
}

export async function loggingPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: AuthRequest) => {
    request.startTime = Date.now();
    request.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Request received', {
      requestId: request.requestId,
      method: request.method,
      path: request.url,
      personId: request.user?.personId,
    });
  });

  fastify.addHook('onResponse', async (request: AuthRequest, reply: FastifyReply) => {
    const duration = Date.now() - (request.startTime || 0);

    logger.info('Response sent', {
      requestId: request.requestId,
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      personId: request.user?.personId,
    });
  });
}