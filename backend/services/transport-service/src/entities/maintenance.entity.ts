import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('vehicle_maintenance')
export class VehicleMaintenance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'vehicle_id' })
    vehicleId: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'maintenance_type' })
    maintenanceType: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number;

    @Column({ name: 'service_date', type: 'date' })
    serviceDate: Date;

    @Column({ name: 'performed_by', nullable: true })
    performedBy: string;

    @Column({ name: 'mileage_at_service', nullable: true })
    mileageAtService: number;

    @Column({ name: 'next_service_mileage', nullable: true })
    nextServiceMileage: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
