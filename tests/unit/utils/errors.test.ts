import { describe, it, expect } from '@jest/globals';
import { ApiError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../../src/utils/errors';
describe('Error Classes', () => {
    describe('ApiError', () => {
        it('should create error with correct properties', () => {
            const error = new ApiError(400, 'Bad Request', 'BAD_REQUEST');
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Bad Request');
            expect(error.code).toBe('BAD_REQUEST');
            expect(error.name).toBe('ApiError');
        });
    });
    describe('ValidationError', () => {
        it('should create validation error', () => {
            const errors = [{ field: 'email', message: 'Invalid email' }];
            const error = new ValidationError('Invalid data', errors);
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Invalid data');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.errors).toEqual(errors);
        });
    });
    describe('UnauthorizedError', () => {
        it('should create unauthorized error with default message', () => {
            const error = new UnauthorizedError();
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Unauthorized');
            expect(error.code).toBe('UNAUTHORIZED');
        });

        it('should create unauthorized error with custom message', () => {
            const error = new UnauthorizedError('Invalid credentials');

            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Invalid credentials');
            expect(error.code).toBe('UNAUTHORIZED');
        });
    });
    describe('ForbiddenError', () => {
        it('should create forbidden error with default message', () => {
            const error = new ForbiddenError();
            expect(error.statusCode).toBe(403);
            expect(error.message).toBe('Forbidden');
            expect(error.code).toBe('FORBIDDEN');
        });

        it('should create forbidden error with custom message', () => {
            const error = new ForbiddenError('Insufficient permissions');

            expect(error.statusCode).toBe(403);
            expect(error.message).toBe('Insufficient permissions');
            expect(error.code).toBe('FORBIDDEN');
        });
    });
    describe('NotFoundError', () => {
        it('should create not found error with default message', () => {
            const error = new NotFoundError();
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('Not Found');
            expect(error.code).toBe('NOT_FOUND');
        });

        it('should create not found error with custom message', () => {
            const error = new NotFoundError('User not found');

            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('User not found');
            expect(error.code).toBe('NOT_FOUND');
        });
    });
});