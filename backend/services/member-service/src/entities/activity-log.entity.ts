import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ActivityType {
    DRIVER_REGISTERED = 'DRIVER_REGISTERED',
    TRIP_CREATED = 'TRIP_CREATED',
    TRIP_COMPLETED = 'TRIP_COMPLETED',
    REPORT_SUBMITTED = 'REPORT_SUBMITTED',
    MEMBER_CREATED = 'MEMBER_CREATED',
    DRIVER_STATUS_CHANGED = 'DRIVER_STATUS_CHANGED',
    SYSTEM = 'SYSTEM',
}

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
    })
    type: ActivityType;

    @Column()
    message: string;

    @Column('jsonb', { nullable: true })
    metadata: any;

    @Column({ name: 'organization_id', nullable: true })
    organizationId: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
