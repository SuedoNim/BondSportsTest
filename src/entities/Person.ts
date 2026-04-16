import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { Account } from './Account';

@Entity('Person')
export class Person {
  @PrimaryGeneratedColumn()
  personId!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  document?: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'date' })
  birthDate!: Date;

  @Column({ type: 'integer' })
  roleId!: number;

  @ManyToOne(() => Role, role => role.persons)
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @OneToMany(() => Account, account => account.person)
  accounts!: Account[];
}