import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({
        type: 'enum',
        enum: ['SUPER_ADMIN', 'ORG_ADMIN', 'DISPATCHER', 'DRIVER'],
        default: 'DRIVER'
    })
    role: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'default_vehicle_id', nullable: true })
    defaultVehicleId: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;
}
