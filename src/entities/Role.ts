import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Person } from './Person';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn()
  roleId!: number;

  @Column({ type: 'text', unique: true })
  type!: string;

  @Column({ type: 'integer' })
  priority!: number;

  @OneToMany(() => Person, person => person.role)
  persons!: Person[];
}