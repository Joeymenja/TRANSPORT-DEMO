import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ActivityType {
    DRIVER_REGISTERED = 'DRIVER_REGISTERED',
    TRIP_CREATED = 'TRIP_CREATED',
    TRIP_COMPLETED = 'TRIP_COMPLETED',
    REPORT_SUBMITTED = 'REPORT_SUBMITTED',
    SYSTEM = 'SYSTEM'
}

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.SYSTEM
    })
    type: ActivityType;

    @Column()
    message: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;
}
