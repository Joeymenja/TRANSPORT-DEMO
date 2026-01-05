import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';

export enum EmploymentStatus {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACTOR = 'CONTRACTOR',
}

@Entity('drivers')
export class Driver {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'license_number', nullable: true })
    licenseNumber: string;

    @Column({ name: 'license_state', nullable: true })
    licenseState: string;

    @Column({ name: 'license_expiry_date', type: 'date', nullable: true })
    licenseExpiryDate: string;

    @Column({
        name: 'employment_status',
        type: 'enum',
        enum: EmploymentStatus,
        nullable: true
    })
    employmentStatus: EmploymentStatus;

    @Column({ name: 'emergency_contact_name', nullable: true })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', nullable: true })
    emergencyContactPhone: string;

    @Column({ name: 'assigned_vehicle_id', nullable: true })
    assignedVehicleId: string;

    @ManyToOne(() => Vehicle)
    @JoinColumn({ name: 'assigned_vehicle_id' })
    assignedVehicle: Vehicle;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({
        name: 'current_status',
        type: 'varchar', // Use varchar for simplicity or enum
        default: 'OFF_DUTY'
    })
    currentStatus: string; // AVAILABLE, ON_BREAK, OFF_DUTY, ON_TRIP

    @Column({ name: 'current_latitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
    currentLatitude: number;

    @Column({ name: 'current_longitude', type: 'decimal', precision: 10, scale: 6, nullable: true })
    currentLongitude: number;

    @Column({ name: 'last_status_update', type: 'timestamp', nullable: true })
    lastStatusUpdate: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
