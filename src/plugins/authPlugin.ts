import { FastifyInstance, FastifyRequest } from 'fastify';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends FastifyRequest {
  user?: {
    personId: number;
    email: string;
    roleId: number;
  };
}

export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async function(request: AuthRequest) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.slice(7);
      const payload = verifyToken(token);

      if (!payload) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      request.user = {
        personId: payload.personId,
        email: payload.email,
        roleId: payload.roleId,
      };
    } catch (error) {
      throw error;
    }
  });

  fastify.register(async (fastify) => {
    fastify.addHook('preHandler', async (_request: AuthRequest) => {
      // Hook is optional - called for protected routes
    });
  });
}