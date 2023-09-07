import { UserEntity } from 'src/auth/user.entity';
import { StudentEntity } from 'src/student/student.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HrMsgEntity } from './hr-msg.entity';

@Entity()
export class HrEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  company: string;

  @Column({
    type: 'tinyint',
  })
  maxReservedStudents: number;

  @OneToMany(() => StudentEntity, (student) => student.hr)
  reservedStudents: StudentEntity[];

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @OneToMany((type) => HrMsgEntity, (entity) => entity.hr)
  hrMsg: HrMsgEntity;
}
