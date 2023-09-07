import { StudentEntity } from "src/student/student.entity";
import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HrEntity } from "./hr.entity";

@Entity()
export class HrMsgEntity extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        default: () => 'CURRENT_TIMESTAMP',
    })
    hiredAt: Date;

    @ManyToOne(
        type => HrEntity,
        entity => entity.id
    )
    hr: HrEntity;

    @OneToOne(
        type => StudentEntity,
    )
    @JoinColumn()
    student: StudentEntity;

    @Column({
        default: false,
    })
    isRead: boolean;
}