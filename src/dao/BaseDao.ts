import { Repository, DataSource, ObjectLiteral, DeepPartial } from 'typeorm';

export abstract class BaseDao<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(dataSource: DataSource, entityClass: any) {
    this.repository = dataSource.getRepository(entityClass);
  }

  async findAll(relations?: string[]): Promise<T[]> {
    return this.repository.find({ relations });
  }

  async findById(id: number, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { [this.getIdFieldName()]: id },
      relations,
    } as any);
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const created = this.repository.create(entity);
    return this.repository.save(created);
  }

  async update(id: number, entity: Partial<T>): Promise<T | null> {
    await this.repository.update({ [this.getIdFieldName()]: id } as any, entity);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete({ [this.getIdFieldName()]: id } as any);
    return result.affected ? result.affected > 0 : false;
  }

  protected abstract getIdFieldName(): string;
}