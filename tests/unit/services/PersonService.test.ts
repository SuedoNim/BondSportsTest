import { describe, it, beforeEach, expect, jest } from '@jest/globals';
import { PersonService } from '../../../src/services/PersonService';
import { PersonDao } from '../../../src/dao/PersonDao';
import { CreatePersonDto } from '../../../src/dtos/person/CreatePersonDto';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
import * as passwordUtils from '../../../src/utils/password';
jest.mock('../../../src/utils/password');
describe('PersonService', () => {
    let service: PersonService;
    let dao: jest.Mocked<PersonDao>;
    beforeEach(() => {
        dao = {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByDocument: jest.fn(),
            findByRoleId: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as any;
        service = new PersonService(dao);
    });
    describe('createPerson', () => {
        it('should create person successfully', async () => {
            const dto: CreatePersonDto = {
                name: 'John Doe',
                document: '12345678900',
                email: 'john@example.com',
                password: 'password123',
                birthDate: '1990-01-01',
                roleId: 2,
            };
            const mockPerson = {
                personId: 1,
                ...dto,
                passwordHash: 'hashed_password',
                birthDate: new Date('1990-01-01'),
            };

            dao.findByEmail.mockResolvedValue(null);
            dao.findByDocument.mockResolvedValue(null);
            (passwordUtils.hashPassword as jest.Mock<(password: string) => Promise<string>>).mockResolvedValue('hashed_password');
            dao.create.mockResolvedValue(mockPerson as any);

            const result = await service.createPerson(dto);

            expect(result).toEqual(mockPerson);
            expect(dao.create).toHaveBeenCalled();
        });

        it('should throw ValidationError if email already exists', async () => {
            const dto: CreatePersonDto = {
                name: 'John Doe',
                document: '12345678900',
                email: 'existing@example.com',
                password: 'password123',
                birthDate: '1990-01-01',
                roleId: 2,
            };

            dao.findByEmail.mockResolvedValue({ personId: 1 } as any);

            await expect(service.createPerson(dto)).rejects.toThrow(ValidationError);
            expect(dao.create).not.toHaveBeenCalled();
        });

        it('should throw ValidationError if document already exists', async () => {
            const dto: CreatePersonDto = {
                name: 'John Doe',
                document: 'existing_doc',
                email: 'john@example.com',
                password: 'password123',
                birthDate: '1990-01-01',
                roleId: 2,
            };

            dao.findByEmail.mockResolvedValue(null);
            dao.findByDocument.mockResolvedValue({ personId: 1 } as any);

            await expect(service.createPerson(dto)).rejects.toThrow(ValidationError);
        });
    });
    describe('getPersonById', () => {
        it('should return person when found', async () => {
            const mockPerson = {
                personId: 1,
                name: 'John Doe',
                email: 'john@example.com',
            };
            dao.findById.mockResolvedValue(mockPerson as any);

            const result = await service.getPersonById(1);

            expect(result).toEqual(mockPerson);
            expect(dao.findById).toHaveBeenCalledWith(1, ['role', 'accounts']);
        });

        it('should throw NotFoundError when person not found', async () => {
            dao.findById.mockResolvedValue(null);

            await expect(service.getPersonById(999)).rejects.toThrow(NotFoundError);
        });
    });
    describe('getPersonByEmail', () => {
        it('should return person when found', async () => {
            const mockPerson = {
                personId: 1,
                email: 'john@example.com',
            };
            dao.findByEmail.mockResolvedValue(mockPerson as any);

            const result = await service.getPersonByEmail('john@example.com');

            expect(result).toEqual(mockPerson);
        });

        it('should throw NotFoundError when person not found', async () => {
            dao.findByEmail.mockResolvedValue(null);

            await expect(service.getPersonByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundError);
        });
    });
    describe('getAllPersons', () => {
        it('should return all persons', async () => {
            const mockPersons = [
                { personId: 1, name: 'John' },
                { personId: 2, name: 'Jane' },
            ];
            dao.findAll.mockResolvedValue(mockPersons as any);

            const result = await service.getAllPersons();

            expect(result).toEqual(mockPersons);
            expect(dao.findAll).toHaveBeenCalledWith(['role', 'accounts']);
        });
    });
    describe('getPersonsByRoleId', () => {
        it('should return persons by role', async () => {
            const mockPersons = [{ personId: 1, roleId: 2 }];
            dao.findByRoleId.mockResolvedValue(mockPersons as any);

            const result = await service.getPersonsByRoleId(2);

            expect(result).toEqual(mockPersons);
            expect(dao.findByRoleId).toHaveBeenCalledWith(2);
        });
    });
});