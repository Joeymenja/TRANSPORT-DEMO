import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';

export enum DocumentType {
    INSURANCE = 'INSURANCE',
    REGISTRATION = 'REGISTRATION',
    OTHER = 'OTHER',
}

@Entity('vehicle_documents')
export class VehicleDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'organization_id' })
    organizationId: string;

    @Column({ name: 'vehicle_id' })
    vehicleId: string;

    @ManyToOne(() => Vehicle)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @Column({
        name: 'document_type',
        type: 'enum',
        enum: DocumentType,
        default: DocumentType.OTHER,
    })
    documentType: DocumentType;

    @Column({ name: 'file_path' })
    filePath: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'file_size' })
    fileSize: number;

    @Column({ name: 'mime_type', nullable: true })
    mimeType: string;

    @Column({ name: 'uploaded_at', default: () => 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;

    @Column({ name: 'expires_at', type: 'date', nullable: true })
    expiresAt: Date;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
