import { DataSource } from 'typeorm';
import { Person } from '../entities/Person';
import { BaseDao } from './BaseDao';
export class PersonDao extends BaseDao<Person> {
    constructor(dataSource: DataSource) {
        super(dataSource, Person);
    }
    async findByEmail(email: string): Promise<Person | null> {
        return this.repository.findOne({
            where: { email },
            relations: ['role', 'accounts'],
        });
    }
    async findByDocument(document: string): Promise<Person | null> {
        return this.repository.findOne({
            where: { document },
            relations: ['role'],
        });
    }
    async findByRoleId(roleId: number): Promise<Person[]> {
        return this.repository.find({
            where: { roleId },
            relations: ['role', 'accounts'],
        });
    }
    protected getIdFieldName(): string {
        return 'personId';
    }
}