import { DataSource } from 'typeorm';
import { Role } from '../entities/Role';
import { logger } from '../utils/logger';

export class DatabaseService {
  constructor(private dataSource: DataSource) {}

  async ensureInitialized(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      logger.info('Initializing database connection');
      await this.dataSource.initialize();
      await this.seedRoles();
      logger.info('Database initialized successfully');
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      logger.error('Database connection check failed', error);
      return false;
    }
  }

  private async seedRoles(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(Role);
    const roleCount = await roleRepository.count();

    if (roleCount === 0) {
      await roleRepository.insert([
        { type: 'ADMIN', priority: 1 },
        { type: 'USER', priority: 2 },
        { type: 'GUEST', priority: 3 },
      ]);
      logger.info('Database seeded with default roles');
    }
  }

  async disconnect(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      logger.info('Database connection closed');
    }
  }
}