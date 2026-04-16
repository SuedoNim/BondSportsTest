import { FastifyInstance, FastifyRequest } from 'fastify';
import { RoleDao } from '../dao/RoleDao';
import { PersonDao } from '../dao/PersonDao';
import { ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

// 1. Extend FastifyInstance to include the checkRole method
declare module 'fastify' {
  interface FastifyInstance {
    checkRole(request: AuthRequest, allowedRoles: string[]): Promise<boolean>;
  }
}

export interface AuthRequest extends FastifyRequest {
  user?: {
    personId: number;
    email: string;
    roleId: number;
  };
}

export function createRoleCheckPlugin(roleDao: RoleDao, personDao: PersonDao) {
  return async function roleCheckPlugin(fastify: FastifyInstance) {
    fastify.decorate('checkRole',
      async function(request: AuthRequest, allowedRoles: string[]) {
        if (!request.user) {
          throw new ForbiddenError('User not authenticated');
        }
        const person = await personDao.findById(request.user.personId);
        if (!person) {
          throw new ForbiddenError('User not found');
        }
        const role = await roleDao.findById(person.roleId);
        if (!role) {
          throw new ForbiddenError('Role not found');
        }
        if (!allowedRoles.includes(role.type)) {
          logger.warn('Access denied due to insufficient role', {
            personId: request.user.personId,
            requiredRoles: allowedRoles,
            userRole: role.type,
          });
          throw new ForbiddenError(
            `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
          );
        }
        return true;
      },
    );
  };
}