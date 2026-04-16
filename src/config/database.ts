import { DataSource } from 'typeorm';
import { config } from './env';
import { Account } from '../entities/Account';
import { Transaction } from '../entities/Transaction';
import { Person } from '../entities/Person';
import { Role } from '../entities/Role';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: config.databasePath,
  synchronize: config.isDevelopment,
  logging: config.isDevelopment,
  entities: [Account, Transaction, Person, Role],
  migrations: [],
  subscribers: [],
});

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✓ Database initialized successfully');
  }
}