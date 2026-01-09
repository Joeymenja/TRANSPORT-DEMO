import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleMaintenance } from './entities/maintenance.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';

import { CreateVehicleDocumentDto } from './dto/vehicle-document.dto';

import { IsString, IsOptional, IsInt, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
    @IsString()
    vehicleNumber: string;

    @IsString()
    @IsOptional()
    make?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    year?: number;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    licensePlate?: string;

    @IsString()
    @IsOptional()
    vin?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    capacity?: number;

    @IsString()
    @IsOptional()
    @IsEnum(['AVAILABLE', 'IN_USE', 'MAINTENANCE'])
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

    @IsString()
    @IsOptional()
    conditionStatus?: string;

    @IsDateString()
    @IsOptional()
    purchaseDate?: Date;

    @IsDateString()
    @IsOptional()
    nextMaintenanceDate?: Date;

    @IsBoolean()
    @IsOptional()
    wheelchairAccessible?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateVehicleDto {
    @IsString()
    @IsOptional()
    vehicleNumber?: string;

    @IsString()
    @IsOptional()
    make?: string;

    @IsString()
    @IsOptional()
    model?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    year?: number;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    licensePlate?: string;

    @IsString()
    @IsOptional()
    vin?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    capacity?: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    odometer?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString()
    @IsOptional()
    @IsEnum(['AVAILABLE', 'IN_USE', 'MAINTENANCE'])
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

    @IsString()
    @IsOptional()
    conditionStatus?: string;

    @IsDateString()
    @IsOptional()
    purchaseDate?: Date;

    @IsDateString()
    @IsOptional()
    nextMaintenanceDate?: Date;

    @IsBoolean()
    @IsOptional()
    wheelchairAccessible?: boolean;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class CreateMaintenanceDto {
    maintenanceType: string;
    description?: string;
    cost?: number;
    serviceDate: Date;
    performedBy?: string;
    mileageAtService?: number;
    nextServiceMileage?: number;
}

@Injectable()
export class VehicleService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @InjectRepository(VehicleMaintenance)
        private readonly maintenanceRepository: Repository<VehicleMaintenance>,
        @InjectRepository(VehicleDocument)
        private readonly documentRepository: Repository<VehicleDocument>,
    ) { }

    async createVehicle(createVehicleDto: CreateVehicleDto, organizationId: string): Promise<Vehicle> {
        try {
            const vehicle = this.vehicleRepository.create({
                ...createVehicleDto,
                organizationId,
                capacity: createVehicleDto.capacity || 4,
            });

            return await this.vehicleRepository.save(vehicle);
        } catch (error) {
            console.error('[VehicleService] createVehicle error:', error);
            throw error;
        }
    }

    async getVehicles(organizationId: string): Promise<Vehicle[]> {
        return this.vehicleRepository.find({
            where: { organizationId, isActive: true },
            order: { vehicleNumber: 'ASC' },
            relations: ['documents'],
        });
    }

    async getVehicleById(vehicleId: string, organizationId: string): Promise<Vehicle> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId, organizationId },
            relations: ['documents'],
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        return vehicle;
    }

    async updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto, organizationId: string): Promise<Vehicle> {
        const vehicle = await this.getVehicleById(vehicleId, organizationId);
        Object.assign(vehicle, updateVehicleDto);
        return this.vehicleRepository.save(vehicle);
    }

    async deleteVehicle(vehicleId: string, organizationId: string): Promise<void> {
        const vehicle = await this.getVehicleById(vehicleId, organizationId);
        vehicle.isActive = false;
        await this.vehicleRepository.save(vehicle);
    }

    async addMaintenanceLog(vehicleId: string, dto: CreateMaintenanceDto, organizationId: string): Promise<VehicleMaintenance> {
        const vehicle = await this.getVehicleById(vehicleId, organizationId);

        const log = this.maintenanceRepository.create({
            ...dto,
            vehicleId: vehicle.id,
            organizationId,
        });

        return this.maintenanceRepository.save(log);
    }

    async getMaintenanceHistory(vehicleId: string, organizationId: string): Promise<VehicleMaintenance[]> {
        // Verify vehicle access
        await this.getVehicleById(vehicleId, organizationId);

        return this.maintenanceRepository.find({
            where: { vehicleId, organizationId },
            order: { serviceDate: 'DESC' },
        });
    }

    async saveDocumentMetadata(
        vehicleId: string,
        organizationId: string,
        file: any,
        dto: CreateVehicleDocumentDto
    ): Promise<VehicleDocument> {
        const vehicle = await this.getVehicleById(vehicleId, organizationId);

        const doc = this.documentRepository.create({
            ...dto,
            organizationId,
            vehicleId: vehicle.id,
            fileName: file.originalname,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        });

        return this.documentRepository.save(doc);
    }

    async getDocuments(vehicleId: string, organizationId: string): Promise<VehicleDocument[]> {
        await this.getVehicleById(vehicleId, organizationId); // Verify access

        return this.documentRepository.find({
            where: { vehicleId, organizationId },
            order: { uploadedAt: 'DESC' },
        });
    }

    async getDocumentById(documentId: string, organizationId: string): Promise<VehicleDocument> {
        const doc = await this.documentRepository.findOne({
            where: { id: documentId, organizationId },
        });

        if (!doc) {
            throw new NotFoundException('Document not found');
        }

        return doc;
    }

    async deleteDocument(documentId: string, organizationId: string): Promise<void> {
        const doc = await this.getDocumentById(documentId, organizationId);
        await this.documentRepository.remove(doc);
        // Note: In production, we should also delete the file from disk/storage
    }
}
