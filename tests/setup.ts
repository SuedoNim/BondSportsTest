import { afterAll, afterEach, beforeAll, jest } from '@jest/globals';

// Mock console methods
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.JWT_EXPIRATION = '24h';
process.env.LOG_LEVEL = 'debug';
process.env.SWAGGER_ENABLED = 'false';
process.env.APP_PORT = '3000';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Suppress console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => { });
  jest.spyOn(console, 'info').mockImplementation(() => { });
  jest.spyOn(console, 'warn').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});