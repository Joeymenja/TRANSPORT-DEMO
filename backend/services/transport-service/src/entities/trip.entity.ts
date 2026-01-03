import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { TripMember } from './trip-member.entity';
import { TripStop } from './trip-stop.entity';
import { Vehicle } from './vehicle.entity';

export enum TripType {
    DROP_OFF = 'DROP_OFF',
    PICK_UP = 'PICK_UP',
    ROUND_TRIP = 'ROUND_TRIP',
}

export enum TripStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_FOR_CLIENTS = 'WAITING_FOR_CLIENTS',
    COMPLETED = 'COMPLETED',
    FINALIZED = 'FINALIZED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

export enum MobilityRequirement {
    AMBULATORY = 'AMBULATORY',
    WHEELCHAIR = 'WHEELCHAIR',
    STRETCHER = 'STRETCHER',
    CAR_SEAT = 'CAR_SEAT',
}

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'trip_date', type: 'date' })
    tripDate: Date;

    @Column({ name: 'assigned_driver_id', nullable: true })
    assignedDriverId: string;

    @Column({ name: 'assigned_vehicle_id', nullable: true })
    assignedVehicleId: string;

    @Column({
        name: 'trip_type',
        type: 'enum',
        enum: TripType,
        default: TripType.DROP_OFF,
    })
    tripType: TripType;

    @Column({ name: 'is_carpool', default: false })
    isCarpool: boolean;

    @Column({ name: 'route_optimized', default: false })
    routeOptimized: boolean;

    @Column({
        type: 'enum',
        enum: TripStatus,
        default: TripStatus.SCHEDULED,
    })
    status: TripStatus;

    @Column({
        name: 'mobility_requirement',
        type: 'enum',
        enum: MobilityRequirement,
        default: MobilityRequirement.AMBULATORY,
    })
    mobilityRequirement: MobilityRequirement;

    @Column({ name: 'cancellation_reason', type: 'varchar', nullable: true })
    cancellationReason: string;

    @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
    cancelledBy: string;

    @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @Column({ name: 'no_show_notes', type: 'text', nullable: true })
    noShowNotes: string;

    @Column({ name: 'started_at', nullable: true })
    startedAt: Date;

    @Column({ name: 'completed_at', nullable: true })
    completedAt: Date;

    @Column({ name: 'finalized_at', nullable: true })
    finalizedAt: Date;

    @Column({ name: 'created_by_id' })
    createdById: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => TripMember, tripMember => tripMember.trip)
    tripMembers: TripMember[];

    @OneToMany(() => TripStop, tripStop => tripStop.trip)
    tripStops: TripStop[];

    @ManyToOne(() => Vehicle)
    @JoinColumn({ name: 'assigned_vehicle_id' })
    assignedVehicle: Vehicle;
}
