import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ name: 'password_hash', select: false })
    passwordHash: string;

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

    @Column({ name: 'organization_id', type: 'uuid' })
    organizationId: string;

    @Column({ name: 'default_vehicle_id', nullable: true })
    defaultVehicleId: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'onboarding_step', default: 0 })
    onboardingStep: number;

    @Column({ name: 'signature_url', type: 'text', nullable: true })
    signatureUrl: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'profile_photo_url', nullable: true })
    profilePhotoUrl: string;

    @Column({ type: 'date', nullable: true })
    dob: Date;

    @Column({ name: 'address_street', nullable: true })
    addressStreet: string;

    @Column({ name: 'address_unit', nullable: true })
    addressUnit: string;

    @Column({ name: 'address_city', nullable: true })
    addressCity: string;

    @Column({ name: 'address_state', nullable: true })
    addressState: string;

    @Column({ name: 'address_zip', nullable: true })
    addressZip: string;

    @Column({ name: 'emergency_contact_name', nullable: true })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', nullable: true })
    emergencyContactPhone: string;

    @Column({ name: 'emergency_contact_relationship', nullable: true })
    emergencyContactRelationship: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
