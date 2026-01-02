import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Trip } from './trip.entity';
import { Member } from './member.entity';

export enum MemberStatus {
    SCHEDULED = 'SCHEDULED',
    PICKED_UP = 'PICKED_UP',
    DROPPED_OFF = 'DROPPED_OFF',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
    COMPLETED = 'COMPLETED',
}

@Entity('trip_members')
export class TripMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'trip_id' })
    tripId: string;

    @ManyToOne(() => Trip, trip => trip.tripMembers)
    @JoinColumn({ name: 'trip_id' })
    trip: Trip;

    @Column({ name: 'member_id' })
    memberId: string;

    @ManyToOne(() => Member)
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ name: 'pickup_stop_id', nullable: true })
    pickupStopId: string;

    @Column({ name: 'dropoff_stop_id', nullable: true })
    dropoffStopId: string;

    @Column({
        name: 'member_status',
        type: 'enum',
        enum: MemberStatus,
        default: MemberStatus.SCHEDULED,
    })
    memberStatus: MemberStatus;

    @Column({ name: 'ready_for_pickup_at', nullable: true })
    readyForPickupAt: Date;

    @Column({ name: 'notification_sent_at', nullable: true })
    notificationSentAt: Date;

    @Column({ name: 'member_signature_base64', type: 'text', nullable: true })
    memberSignatureBase64: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
