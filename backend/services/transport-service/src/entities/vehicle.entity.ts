import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VehicleDocument } from './vehicle-document.entity';

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'vehicle_number' })
    vehicleNumber: string;

    @Column({ nullable: true })
    make: string;

    @Column({ nullable: true })
    model: string;

    @Column({ nullable: true })
    year: number;

    @Column({ name: 'license_plate', nullable: true })
    licensePlate: string;

    @Column({ nullable: true })
    vin: string;

    @Column({ default: 4 })
    capacity: number;

    @Column({ nullable: true })
    odometer: number;

    @Column({ nullable: true })
    color: string;

    @Column({ name: 'vehicle_type', nullable: true })
    vehicleType: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 50, default: 'AVAILABLE' })
    status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

    @Column({ name: 'condition_status', default: 'GOOD' })
    conditionStatus: string;

    @Column({ name: 'purchase_date', type: 'date', nullable: true })
    purchaseDate: Date;

    @Column({ name: 'next_maintenance_date', type: 'date', nullable: true })
    nextMaintenanceDate: Date;

    @Column({ name: 'wheelchair_accessible', default: false })
    wheelchairAccessible: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => VehicleDocument, (document) => document.vehicle)
    documents: VehicleDocument[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
