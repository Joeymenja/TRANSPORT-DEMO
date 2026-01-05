import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
    DRIVER_PENDING = 'DRIVER_PENDING',
    TRIP_REPORT_SUBMITTED = 'TRIP_REPORT_SUBMITTED',
    TRIP_CANCELLED = 'TRIP_CANCELLED',
    INCIDENT_REPORTED = 'INCIDENT_REPORTED',
}

export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ',
    ARCHIVED = 'ARCHIVED',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD,
    })
    status: NotificationStatus;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        driverId?: string;
        tripReportId?: string;
        tripId?: string;
        userId?: string;
        [key: string]: any;
    };

    @Column({ name: 'read_at', nullable: true })
    readAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
