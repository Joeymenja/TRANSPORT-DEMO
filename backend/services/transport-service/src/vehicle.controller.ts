import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { VehicleService, CreateVehicleDto, UpdateVehicleDto } from './vehicle.service';
import { Vehicle } from './entities/vehicle.entity';

@Controller('vehicles')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Post()
    async createVehicle(
        @Body() createVehicleDto: CreateVehicleDto,
        @Request() req,
    ): Promise<Vehicle> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.createVehicle(createVehicleDto, organizationId);
    }

    @Get()
    async getVehicles(@Request() req): Promise<Vehicle[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.getVehicles(organizationId);
    }

    @Get(':id')
    async getVehicleById(
        @Param('id') id: string,
        @Request() req,
    ): Promise<Vehicle> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.getVehicleById(id, organizationId);
    }

    @Put(':id')
    async updateVehicle(
        @Param('id') id: string,
        @Body() updateVehicleDto: UpdateVehicleDto,
        @Request() req,
    ): Promise<Vehicle> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.updateVehicle(id, updateVehicleDto, organizationId);
    }

    @Delete(':id')
    async deleteVehicle(
        @Param('id') id: string,
        @Request() req,
    ): Promise<{ message: string }> {
        const organizationId = req.headers['x-organization-id'];
        await this.vehicleService.deleteVehicle(id, organizationId);
        return { message: 'Vehicle deleted successfully' };
    }
}
