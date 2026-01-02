import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Trip } from './trip.entity';

export enum StopType {
    PICKUP = 'PICKUP',
    DROPOFF = 'DROPOFF',
}

@Entity('trip_stops')
export class TripStop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'trip_id' })
    tripId: string;

    @ManyToOne(() => Trip, trip => trip.tripStops)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({
        name: 'stop_type',
        type: 'enum',
        enum: StopType,
    })
    stopType: StopType;

    @Column({ name: 'stop_order' })
    stopOrder: number;

    @Column({ type: 'text' })
    address: string;

    @Column({ name: 'gps_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
    gpsLatitude: number;

    @Column({ name: 'gps_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
    gpsLongitude: number;

    @Column({ name: 'scheduled_time', nullable: true })
    scheduledTime: Date;

    @Column({ name: 'actual_arrival_time', nullable: true })
    actualArrivalTime: Date;

    @Column({ name: 'actual_departure_time', nullable: true })
    actualDepartureTime: Date;

    @Column({ name: 'odometer_reading', nullable: true })
    odometerReading: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
