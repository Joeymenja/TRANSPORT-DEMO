import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    subdomain: string;

    @Column({ name: 'ensora_api_key', type: 'text', nullable: true })
    ensoraApiKey: string;

    @Column({ name: 'ensora_api_endpoint', type: 'varchar', length: 500, nullable: true })
    ensoraApiEndpoint: string;

    @Column({ name: 'ensora_sync_enabled', type: 'boolean', default: false })
    ensoraSyncEnabled: boolean;

    @Column({ name: 'ensora_last_sync_at', type: 'timestamp', nullable: true })
    ensoraLastSyncAt: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
