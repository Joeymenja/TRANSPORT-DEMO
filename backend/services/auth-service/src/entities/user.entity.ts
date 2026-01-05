import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { DriverDocument } from './driver-document.entity';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ORG_ADMIN = 'ORG_ADMIN',
    DISPATCHER = 'DISPATCHER',
    DRIVER = 'DRIVER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id', type: 'uuid' })
    organizationId: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column()
    email: string;

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({
        type: 'enum',
        enum: UserRole,
    })
    role: UserRole;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'profile_photo_url', nullable: true })
    profilePhotoUrl: string;

    @Column({ type: 'date', nullable: true })
    dob: string;

    // Address Fields
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

    // Emergency Contact (Denormalized here for easy access, or sync with Driver entity)
    @Column({ name: 'emergency_contact_name', nullable: true })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', nullable: true })
    emergencyContactPhone: string;

    @Column({ name: 'emergency_contact_relationship', nullable: true })
    emergencyContactRelationship: string;

    @Column({ name: 'default_vehicle_id', nullable: true })
    defaultVehicleId: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'onboarding_step', default: 0 })
    onboardingStep: number;

    @OneToMany(() => DriverDocument, (doc) => doc.user)
    driverDocuments: DriverDocument[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
