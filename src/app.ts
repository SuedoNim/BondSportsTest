import Fastify, { FastifyInstance } from 'fastify';
import fastifySwagger from 'fastify-swagger';
import swaggerUi from '@fastify/swagger-ui';
import { setupErrorHandler } from './hooks/errorHandler';
import { loggingPlugin } from './plugins/loggingPlugin';
import { authPlugin } from './plugins/authPlugin';
import { createRoleCheckPlugin } from './plugins/roleCheckPlugin';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';
import { config } from './config/env';

export async function createApp(container: any): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: config.isDevelopment ? true : false,
  });

  // Register Swagger
  if (config.swaggerEnabled) {
    await fastify.register(fastifySwagger, {
      swagger: {
        info: {
          title: 'Banking API',
          description: 'Production-ready Banking API with CRUD operations',
          version: '1.0.0',
        },
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/api/docs',
    });
  }

  // Register plugins
  await fastify.register(loggingPlugin);
  await fastify.register(authPlugin);
  await fastify.register(
    createRoleCheckPlugin(
      container.cradle.roleDao,
      container.cradle.personDao
    ),
  );

  // Setup error handler
  await setupErrorHandler(fastify);

  // Health check route
  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Setup API routes
  await setupRoutes(fastify, container);

  logger.info('Fastify app created successfully');

  return fastify;
}

export async function startServer(
  fastify: FastifyInstance,
  port: number,
): Promise<void> {
  await fastify.listen({ port, host: '0.0.0.0' });
  logger.info(`Server running on http://localhost:${port}`);
  logger.info(`Swagger docs available at http://localhost:${port}/api/docs`);
}