import { DataSource } from 'typeorm';
import { Role } from '../entities/Role';
import { BaseDao } from './BaseDao';
export class RoleDao extends BaseDao<Role> {
    constructor(dataSource: DataSource) {
        super(dataSource, Role);
    }
    async findByType(type: string): Promise<Role | null> {
        return this.repository.findOne({ where: { type } });
    }
    async findByPriority(priority: number): Promise<Role[]> {
        return this.repository.find({
            where: { priority },
            relations: ['persons'],
        });
    }
    protected getIdFieldName(): string {
        return 'roleId';
    }
}