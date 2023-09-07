import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'src/types/user/user.type';

@Entity()
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: null,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: null,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  hash: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: null,
  })
  salt: string;

  @Column({
    type: 'varchar',
    length: 32,
    default: null,
  })
  iv: string;

  @Column({
    type: 'varchar',
    length: 36,
    default: null,
  })
  jwt: string | null;

  @Column({
    type: 'bool',
    default: false,
  })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  link: string | null;

  @Column({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;
}
