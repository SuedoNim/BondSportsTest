interface Config {
  nodeEnv: string;
  port: number;
  jwtSecret: string;
  jwtExpiration: any; // Explicitly 'string', not 'string | number'
  databasePath: string;
  logLevel: string;
  isDevelopment: boolean;
  swaggerEnabled: boolean;
  swaggerPath: string;
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiration: (process.env.JWT_EXPIRATION || '24h') as string, // Ensure it's always a string
  databasePath: process.env.DATABASE_PATH || ':',
  logLevel: process.env.LOG_LEVEL || 'info',
  isDevelopment: process.env.NODE_ENV === 'development',
  swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
  swaggerPath: process.env.SWAGGER_PATH || '/api/docs',
};