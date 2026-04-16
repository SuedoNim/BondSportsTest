import { describe, it, expect, jest } from '@jest/globals';
import * as passwordUtils from '../../../src/utils/password';
import bcryptjs from 'bcryptjs';
jest.mock('bcryptjs');
describe('Password Utilities', () => {
    const password = 'password123';
    const hashedPassword = '2a$10hashed_password_here';

    describe('hashPassword', () => {
        it('should hash password successfully', async () => {
            (bcryptjs.hash as jest.MockedFunction<(password: string, salt: string | number) => Promise<string>>).mockResolvedValue(hashedPassword);
            const result = await passwordUtils.hashPassword(password);

            expect(result).toBe(hashedPassword);
            expect(bcryptjs.hash).toHaveBeenCalledWith(password, 10);
        });

        it('should handle hashing errors', async () => {
            (bcryptjs.hash as jest.Mock<(password: string, salt: string | number) => Promise<string>>).mockRejectedValue(new Error('Hash failed'));

            await expect(passwordUtils.hashPassword(password)).rejects.toThrow('Hash failed');
        });
    });
    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            (bcryptjs.compare as jest.Mock<(password: string, hash: string) => Promise<boolean>>).mockResolvedValue(true);
            const result = await passwordUtils.comparePassword(password, hashedPassword);

            expect(result).toBe(true);
            expect(bcryptjs.compare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('should return false for non-matching passwords', async () => {
            (bcryptjs.compare as jest.Mock<(password: string, hash: string) => Promise<boolean>>).mockResolvedValue(false);

            const result = await passwordUtils.comparePassword('wrongpassword', hashedPassword);

            expect(result).toBe(false);
        });

        it('should handle comparison errors', async () => {
            (bcryptjs.compare as jest.Mock<(password: string, hash: string) => Promise<boolean>>).mockRejectedValue(new Error('Compare failed'));

            await expect(
                passwordUtils.comparePassword(password, hashedPassword)
            ).rejects.toThrow('Compare failed');
        });
    });
});