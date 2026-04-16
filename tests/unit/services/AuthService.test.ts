import { describe, beforeEach, expect, jest, it } from '@jest/globals';
import { AuthService } from '../../../src/services/AuthService';
import { PersonService } from '../../../src/services/PersonService';
import { LoginDto } from '../../../src/dtos/auth/LoginDto';
import { UnauthorizedError } from '../../../src/utils/errors';
import * as passwordUtils from '../../../src/utils/password';
import * as jwtUtils from '../../../src/utils/jwt';

jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/jwt');

describe('AuthService', () => {
    let service: AuthService;
    let personService: jest.Mocked<PersonService>;

    beforeEach(() => {
        personService = {
            getPersonByEmail: jest.fn(),
        } as any;
        service = new AuthService(personService);
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const dto: LoginDto = {
                email: 'user@example.com',
                password: 'password123',
            };

            const mockPerson = {
                personId: 1,
                email: 'user@example.com',
                passwordHash: 'hashed_password',
                roleId: 2,
            };

            const mockToken = 'jwt_token_here';
            const mockPayload = {
                personId: 1,
                email: 'user@example.com',
                roleId: 2,
            };

            personService.getPersonByEmail.mockResolvedValue(mockPerson as any);
            (passwordUtils.comparePassword as jest.Mock<(password: string, hash: string) => Promise<boolean>>).mockResolvedValue(true);
            (jwtUtils.generateToken as jest.Mock).mockReturnValue(mockToken);

            const result = await service.login(dto);

            expect(result).toEqual({
                token: mockToken,
                payload: mockPayload,
            });
            expect(personService.getPersonByEmail).toHaveBeenCalledWith('user@example.com');
            expect(passwordUtils.comparePassword).toHaveBeenCalledWith('password123', 'hashed_password');
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockPayload);
        });

        it('should throw UnauthorizedError for invalid password', async () => {
            const dto: LoginDto = {
                email: 'user@example.com',
                password: 'wrongpassword',
            };

            const mockPerson = {
                personId: 1,
                email: 'user@example.com',
                passwordHash: 'hashed_password',
                roleId: 2,
            };

            personService.getPersonByEmail.mockResolvedValue(mockPerson as any);
            (passwordUtils.comparePassword as jest.Mock<(password: string, hash: string) => Promise<boolean>>).mockResolvedValue(false);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedError);
        });

        it('should throw NotFoundError for non-existent user', async () => {
            const dto: LoginDto = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };

            personService.getPersonByEmail.mockRejectedValue(new Error('User not found'));

            await expect(service.login(dto)).rejects.toThrow();
        });
    });
});