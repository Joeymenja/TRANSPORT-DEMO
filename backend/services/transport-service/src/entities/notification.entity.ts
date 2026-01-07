import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

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

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({
        type: 'varchar',
        length: 50,
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({
        type: 'varchar',
        length: 20,
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

    @Column({ name: 'read_at', type: 'timestamp', nullable: true })
    readAt: Date;

    @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
    archivedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
