import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import { AppDataSource } from './database';

// DAOs
import { AccountDao } from '../dao/AccountDao';
import { TransactionDao } from '../dao/TransactionDao';
import { PersonDao } from '../dao/PersonDao';
import { RoleDao } from '../dao/RoleDao';

// Services
import { AccountService } from '../services/AccountService';
import { TransactionService } from '../services/TransactionService';
import { PersonService } from '../services/PersonService';
import { AuthService } from '../services/AuthService';
import { DatabaseService } from '../services/DatabaseService';

export function createDIContainer() {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  });

  // Register DataSource
  container.register({
    dataSource: asValue(AppDataSource),
  });

  // Register DAOs
  container.register({
    accountDao: asClass(AccountDao).singleton(),
    transactionDao: asClass(TransactionDao).singleton(),
    personDao: asClass(PersonDao).singleton(),
    roleDao: asClass(RoleDao).singleton(),
  });

  // Register Services
  container.register({
    accountService: asClass(AccountService).singleton(),
    transactionService: asClass(TransactionService).singleton(),
    personService: asClass(PersonService).singleton(),
    authService: asClass(AuthService).singleton(),
    databaseService: asClass(DatabaseService).singleton(),
  });

  return container;
}