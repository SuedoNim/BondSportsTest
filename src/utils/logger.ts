import { config } from '../config/env';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  level = config.logLevel;
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(this.level.toLowerCase()) <= levels.indexOf(level.toLowerCase());
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[${new Date().toISOString()}] [DEBUG]`, message, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[${new Date().toISOString()}] [INFO]`, message, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[${new Date().toISOString()}] [WARN]`, message, data || '');
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        `[${new Date().toISOString()}] [ERROR]`,
        message,
        error?.message || error || '',
      );
    }
  }
}

export const logger = new Logger();