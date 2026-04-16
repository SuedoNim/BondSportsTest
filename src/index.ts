import { createDIContainer } from './config/container';
import { initializeDatabase } from './config/database';
import { createApp, startServer } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

async function main() {
  try {
    logger.info('Starting application', { environment: config.nodeEnv });

    // Initialize database
    await initializeDatabase();

    // Create DI container
    const container = createDIContainer();

    // Create Fastify app
    const app = await createApp(container);

    // Start server
    await startServer(app, config.port);

    logger.info('Application started successfully', { port: config.port });

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`${signal} received, gracefully shutting down`);
        await app.close();
        process.exit(0);
      });
    }
  } catch (error) {
    logger.error('Fatal error during startup', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});