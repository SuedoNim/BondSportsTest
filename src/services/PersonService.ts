import { PersonDao } from '../dao/PersonDao';
import { Person } from '../entities/Person';
import { CreatePersonDto } from '../dtos/person/CreatePersonDto';
import { NotFoundError, ValidationError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { logger } from '../utils/logger';
export class PersonService {
    constructor(private personDao: PersonDao) { }
    async createPerson(dto: CreatePersonDto): Promise<Person> {
        logger.debug('Creating person', { email: dto.email, document: dto.document });
        const existingEmail = await this.personDao.findByEmail(dto.email);
        if (existingEmail) {
            throw new ValidationError('Email already exists');
        }

        if (dto.document != null) {
            const existingDoc = await this.personDao.findByDocument(dto.document);
            if (existingDoc) {
                throw new ValidationError('Document already exists');
            }
        }

        const passwordHash = await hashPassword(dto.password);

        const person = await this.personDao.create({
            name: dto.name,
            document: dto.document,
            email: dto.email,
            passwordHash,
            birthDate: new Date(dto.birthDate),
            roleId: dto.roleId,
        });

        logger.info('Person created successfully', { personId: person.personId });
        return person;
    }
    async getPersonById(personId: number): Promise<Person> {
        const person = await this.personDao.findById(personId, ['role', 'accounts']);
        if (!person) {
            throw new NotFoundError(`Person with ID ${personId} not found`);
        }

        return person;
    }
    async getPersonByEmail(email: string): Promise<Person> {
        const person = await this.personDao.findByEmail(email);
        if (!person) {
            throw new NotFoundError(`Person with email ${email} not found`);
        }

        return person;
    }
    async getAllPersons(): Promise<Person[]> {
        return this.personDao.findAll(['role', 'accounts']);
    }
    async getPersonsByRoleId(roleId: number): Promise<Person[]> {
        return this.personDao.findByRoleId(roleId);
    }
}