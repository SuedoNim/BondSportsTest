import { describe, it, expect, jest, afterEach, afterAll } from '@jest/globals';
import { logger, LogLevel } from '../../../src/utils/logger';

describe('Logger', () => {
    logger.setLevel(LogLevel.DEBUG);

    const consoleSpy = {
        log: jest.spyOn(console, 'log').mockImplementation(() => { }),
        debug: jest.spyOn(console, 'debug').mockImplementation(() => { }),
        warn: jest.spyOn(console, 'warn').mockImplementation(() => { }),
        error: jest.spyOn(console, 'error').mockImplementation(() => { }),
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('debug', () => {
        it('should log debug message', () => {
            logger.debug('Debug message', { data: 'test' });
            expect(consoleSpy.log).toHaveBeenCalled();
            const call = consoleSpy.log.mock.calls[0];
            expect(call[0]).toContain('[DEBUG]');
            expect(call[1]).toBe('Debug message');
        });
    });

    describe('info', () => {
        it('should log info message', () => {
            logger.info('Info message', { data: 'test' });
            expect(consoleSpy.log).toHaveBeenCalled();
            const call = consoleSpy.log.mock.calls[0];
            expect(call[0]).toContain('[INFO]');
            expect(call[1]).toBe('Info message');
        });
    });

    describe('warn', () => {
        it('should log warning message', () => {
            logger.warn('Warning message', { data: 'test' });
            expect(consoleSpy.warn).toHaveBeenCalled();
            const call = consoleSpy.warn.mock.calls[0];
            expect(call[0]).toContain('[WARN]');
            expect(call[1]).toBe('Warning message');
        });
    });

    describe('error', () => {
        it('should log error message', () => {
            const error = new Error('Test error');
            logger.error('Error message', error);
            expect(consoleSpy.error).toHaveBeenCalled();
            const call = consoleSpy.error.mock.calls[0];
            expect(call[0]).toContain('[ERROR]');
            expect(call[1]).toBe('Error message');
        });

        it('should log error without Error object', () => {
            logger.error('Error message');
            expect(consoleSpy.error).toHaveBeenCalled();
        });
    });
});