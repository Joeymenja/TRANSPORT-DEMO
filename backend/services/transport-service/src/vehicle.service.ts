import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

export class CreateVehicleDto {
    vehicleNumber: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    vin?: string;
    capacity?: number;
}

export class UpdateVehicleDto {
    vehicleNumber?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    vin?: string;
    capacity?: number;
    odometer?: number;
    isActive?: boolean;
}

@Injectable()
export class VehicleService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
    ) { }

    async createVehicle(createVehicleDto: CreateVehicleDto, organizationId: string): Promise<Vehicle> {
        const vehicle = this.vehicleRepository.create({
            ...createVehicleDto,
            organizationId,
            capacity: createVehicleDto.capacity || 4,
        });

        return this.vehicleRepository.save(vehicle);
    }

    async getVehicles(organizationId: string): Promise<Vehicle[]> {
        return this.vehicleRepository.find({
            where: { organizationId, isActive: true },
            order: { vehicleNumber: 'ASC' },
        });
    }

    async getVehicleById(vehicleId: string, organizationId: string): Promise<Vehicle> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId, organizationId },
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
}
