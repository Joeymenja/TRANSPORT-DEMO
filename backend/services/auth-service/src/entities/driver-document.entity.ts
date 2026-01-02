import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum DocumentType {
    LICENSE = 'LICENSE',
    INSURANCE = 'INSURANCE',
    BACKGROUND_CHECK = 'BACKGROUND_CHECK',
}

export enum DocumentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Entity('driver_documents')
export class DriverDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'enum',
        enum: DocumentType,
    })
    documentType: DocumentType;

    @Column({ name: 'file_url' })
    fileUrl: string;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING,
    })
    status: DocumentStatus;

    @Column({ name: 'expiry_date', type: 'date', nullable: true })
    expiryDate: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
