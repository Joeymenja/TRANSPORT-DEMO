import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Trip } from './trip.entity';
import { Member } from './member.entity';

export enum TripReportStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    ARCHIVED = 'ARCHIVED',
}

@Entity('trip_reports')
export class TripReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'trip_id' })
    tripId: string;

    @ManyToOne(() => Trip, trip => trip.tripReports)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ name: 'member_id', nullable: true })
    memberId: string;

    @ManyToOne(() => Member)
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'driver_id', nullable: true })
    driverId: string;

    @Column({
        type: 'enum',
        enum: TripReportStatus,
        default: TripReportStatus.DRAFT,
    })
    status: TripReportStatus;

    // MVP: Store signature directly for simplicity
    @Column({ name: 'passenger_signature', type: 'text', nullable: true })
    passengerSignature: string;

    @Column({ name: 'passenger_signed_at', nullable: true })
    passengerSignedAt: Date;

    @Column({ name: 'refused_signature', default: false })
    refusedSignature: boolean;

    @Column({ name: 'refusal_reason', nullable: true })
    refusalReason: string;

    @Column({ name: 'driver_attestation', default: false })
    driverAttestation: boolean;

    @Column({ name: 'driver_attested_at', nullable: true })
    driverAttestedAt: Date;

    @Column({ name: 'pdf_file_path', nullable: true })
    pdfFilePath: string;

    @Column({ name: 'notes', nullable: true })
    notes: string;

    @Column({ name: 'start_odometer', type: 'decimal', precision: 10, scale: 1, nullable: true })
    startOdometer: number;

    @Column({ name: 'end_odometer', type: 'decimal', precision: 10, scale: 1, nullable: true })
    endOdometer: number;

    @Column({ name: 'submitted_at', nullable: true })
    submittedAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // --- Added for PDF Service Compatibility ---
    @Column({ name: 'pickup_time', nullable: true })
    pickupTime: Date;

    @Column({ name: 'dropoff_time', nullable: true })
    dropoffTime: Date;

    @Column({ name: 'total_miles', type: 'decimal', precision: 10, scale: 1, nullable: true })
    totalMiles: number;

    @Column({ name: 'service_verified', default: false })
    serviceVerified: boolean;

    @Column({ name: 'client_arrived', default: false })
    clientArrived: boolean;

    @Column({ name: 'incident_reported', default: false })
    incidentReported: boolean;

    @Column({ name: 'incident_description', nullable: true })
    incidentDescription: string;

    @OneToMany('Signature', 'tripReport')
    signatures: any[]; // using any[] to avoid circular dependency import issues for now, or use string logic
}
