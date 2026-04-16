import { describe, it, expect, jest } from '@jest/globals';
import * as jwtUtils from '../../../src/utils/jwt';
import jwt from 'jsonwebtoken';
import { config } from '../../../src/config/env';

jest.mock('jsonwebtoken');
jest.mock('../../../src/config/env', () => ({
  config: {
    jwtSecret: 'test-secret-key-12345',
  },
}));

describe('JWT Utilities', () => {
    const mockPayload = {
        personId: 1,
        email: 'test@example.com',
        roleId: 2,
    };
    describe('generateToken', () => {
        it('should generate a valid token', () => {
            const mockToken = 'valid.jwt.token';
            (jwt.sign as jest.Mock).mockReturnValue(mockToken);
            const token = jwtUtils.generateToken(mockPayload);

            expect(token).toBe(mockToken);
            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                config.jwtSecret,
                expect.any(Object)
            );
        });
    });
    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecoded = {
                ...mockPayload,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400,
            };
            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

            const result = jwtUtils.verifyToken(mockToken);

            expect(result).toEqual(mockDecoded);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.jwtSecret, expect.any(Object));
        });

        it('should return null for invalid token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
       throw new Error('Invalid token');
   });

            const result = jwtUtils.verifyToken('invalid.token');

            expect(result).toBeNull();
        });

        it('should return null for expired token', () => {
            (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Token expired'); });

            const result = jwtUtils.verifyToken('expired.token');

            expect(result).toBeNull();
        });
    });
    describe('decodeToken', () => {
        it('should decode a token', () => {
            const mockToken = 'valid.jwt.token';
            const mockDecoded = mockPayload;
            (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);

            const result = jwtUtils.decodeToken(mockToken);

            expect(result).toEqual(mockDecoded);
            expect(jwt.decode).toHaveBeenCalledWith(mockToken, { complete: false });
        });

        it('should return null for invalid token', () => {
            (jwt.decode as jest.Mock).mockImplementation(()=> {throw new Error('Invalid token');});

            const result = jwtUtils.decodeToken('invalid.token');

            expect(result).toBeNull();
        });
    });
});