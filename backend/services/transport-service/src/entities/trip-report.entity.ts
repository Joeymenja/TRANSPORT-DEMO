import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Trip } from './trip.entity';
import { TripMember } from './trip-member.entity';
import { Signature } from './signature.entity';

@Entity('trip_reports')
export class TripReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'trip_id' })
    tripId: string;

    @OneToOne('Trip')
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    // We might want separate reports per member for carpools,
    // but for now, let's assume 1 report per trip execution for simplicity 
    // unless the "Multi-Client Report" requirement forces 1-per-member.
    // The requirement says "Carpool Trip Reports: generate one report per client".
    // So distinct reports linked to TripMember is better.

    @Column({ name: 'trip_member_id', nullable: true })
    tripMemberId: string;

    @OneToOne('TripMember')
    @JoinColumn({ name: 'trip_member_id' })
    tripMember: TripMember;

    // Time & Mileage
    @Column({ name: 'pickup_time', type: 'timestamp', nullable: true })
    pickupTime: Date;

    @Column({ name: 'dropoff_time', type: 'timestamp', nullable: true })
    dropoffTime: Date;

    @Column({ name: 'start_odometer', type: 'decimal', precision: 10, scale: 1, nullable: true })
    startOdometer: number;

    @Column({ name: 'end_odometer', type: 'decimal', precision: 10, scale: 1, nullable: true })
    endOdometer: number;

    @Column({ name: 'total_miles', type: 'decimal', precision: 10, scale: 1, nullable: true })
    totalMiles: number;

    // Details
    @Column({ name: 'appointment_type', nullable: true })
    appointmentType: string; // e.g., "Dialysis", "Primary Care"

    @Column({ name: 'service_verified', default: false })
    serviceVerified: boolean;

    @Column({ name: 'client_arrived', default: false })
    clientArrived: boolean;

    @Column({ name: 'client_checked_in', default: false })
    clientCheckedIn: boolean;

    @Column({ name: 'incident_reported', default: false })
    incidentReported: boolean;

    @Column({ name: 'incident_description', type: 'text', nullable: true })
    incidentDescription: string;

    @Column({ name: 'driver_notes', type: 'text', nullable: true })
    driverNotes: string;

    @OneToMany('Signature', 'tripReport', { cascade: true })
    signatures: Signature[];

    @Column({ name: 'status', default: 'DRAFT' })
    status: string; // DRAFT, SUBMITTED

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
