import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    subdomain: string;

    @Column({ name: 'ensora_api_key', nullable: true })
    ensoraApiKey: string;

    @Column({ name: 'ensora_api_endpoint', nullable: true })
    ensoraApiEndpoint: string;

    @Column({ name: 'ensora_sync_enabled', default: false })
    ensoraSyncEnabled: boolean;

    @Column({ name: 'ensora_last_sync_at', nullable: true })
    ensoraLastSyncAt: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
