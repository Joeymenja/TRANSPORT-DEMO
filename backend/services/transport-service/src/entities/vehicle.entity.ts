import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
