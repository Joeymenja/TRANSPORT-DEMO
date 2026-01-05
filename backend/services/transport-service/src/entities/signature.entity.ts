import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TripReport } from './trip-report.entity';

export enum SignatureType {
    DRIVER = 'DRIVER',
    CLIENT = 'CLIENT',
    FACILITY = 'FACILITY'
}

@Entity('signatures')
export class Signature {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'trip_report_id', nullable: true })
    tripReportId: string;

    @ManyToOne('TripReport', 'signatures')
    @JoinColumn({ name: 'trip_report_id' })
    tripReport: TripReport;

    @Column({
        type: 'enum',
        enum: SignatureType
    })
    type: SignatureType;

    @Column({ name: 'signer_name' })
    signerName: string;

    @Column({ name: 'signer_role', nullable: true })
    signerRole: string; // e.g., "Nurse", "Guardian"

    @Column({ name: 'signature_url', type: 'text' }) // Storing base64 or URL
    signatureUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        timestamp: string;
        deviceId?: string;
        ipAddress?: string;
        gpsCoordinates?: { lat: number; lng: number };
    };

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
