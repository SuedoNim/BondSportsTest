import { AppDataSource, initializeDatabase } from '../config/database';
import { Role } from '../entities/Role';
import { logger } from '../utils/logger';

async function seed() {
  try {
    await initializeDatabase();
    const roleRepository = AppDataSource.getRepository(Role);

    const roleCount = await roleRepository.count();
    if (roleCount === 0) {
      await roleRepository.insert([
        { type: 'ADMIN', priority: 1 },
        { type: 'USER', priority: 2 },
        { type: 'GUEST', priority: 3 },
      ]);
      logger.info('✓ Database seeded with default roles');
    } else {
      logger.info('✓ Database already seeded');
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed', error);
    process.exit(1);
  }
}

seed();