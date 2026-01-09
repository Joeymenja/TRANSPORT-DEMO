import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Trip } from './trip.entity';

export enum ClaimStatus {
  UNBILLED = 'UNBILLED',
  QUEUED = 'QUEUED',
  SUBMITTED = 'SUBMITTED',
  PAID = 'PAID',
  DENIED = 'DENIED',
  NEEDS_REVIEW = 'NEEDS_REVIEW'
}

@Entity()
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  claimNumber: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.UNBILLED
  })
  status: ClaimStatus;

  @Column({ nullable: true })
  payerControlNumber: string;

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column()
  tripId: string;

  @Column({ nullable: true })
  diagnosisCode: string; // ICD-10

  @Column({ nullable: true })
  procedureCode: string; // HCPCS (e.g., A0100)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  billedAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  submissionData: any;

  @Column({ type: 'jsonb', nullable: true })
  responseDetails: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  paidAt: Date;
}
