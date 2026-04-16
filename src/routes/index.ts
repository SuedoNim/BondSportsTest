import { FastifyInstance } from 'fastify';
import { authRoutes } from './authRoutes';
import { accountRoutes } from './accountRoutes';
import { transactionRoutes } from './transactionRoutes';
import { AuthRequest } from '../plugins/authPlugin';
import { createRoleCheckPlugin } from '../plugins/roleCheckPlugin';

export async function setupRoutes(fastify: FastifyInstance, container: any) {
  const {
    authService,
    accountService,
    transactionService
  } = container.cradle;

  // Register the role check plugin
  await fastify.register(createRoleCheckPlugin(
    container.cradle.roleDao,
    container.cradle.personDao,
  ));

  // Create role check function
  const roleCheckFn = async (request: AuthRequest, allowedRoles: string[]) => {
    return fastify.checkRole(request, allowedRoles);
  };

  // Register route handlers
  await authRoutes(fastify, authService);
  await accountRoutes(fastify, accountService, roleCheckFn);
  await transactionRoutes(fastify, transactionService, roleCheckFn);
}