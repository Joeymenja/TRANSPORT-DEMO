import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MobilityRequirement {
    AMBULATORY = 'AMBULATORY',
    WHEELCHAIR = 'WHEELCHAIR',
    STRETCHER = 'STRETCHER',
    BURIATRIC_WHEELCHAIR = 'BURIATRIC_WHEELCHAIR',
}

@Entity('members')
export class Member {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'member_id' })
    memberId: string; // AHCCCS ID

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: Date;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    // Enhanced Fields
    @Column({
        name: 'mobility_requirement',
        type: 'enum',
        enum: MobilityRequirement,
        default: MobilityRequirement.AMBULATORY,
    })
    mobilityRequirement: MobilityRequirement;

    @Column({ name: 'insurance_provider', nullable: true })
    insuranceProvider: string;

    @Column({ name: 'insurance_id', nullable: true })
    insuranceId: string;

    @Column({ name: 'emergency_contact_name', nullable: true })
    emergencyContactName: string;

    @Column({ name: 'emergency_contact_phone', nullable: true })
    emergencyContactPhone: string;

    @Column({ name: 'special_notes', type: 'text', nullable: true })
    specialNotes: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
