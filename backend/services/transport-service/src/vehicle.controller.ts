import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VehicleService, CreateVehicleDto, UpdateVehicleDto, CreateMaintenanceDto } from './vehicle.service';
import { CreateVehicleDocumentDto } from './dto/vehicle-document.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleMaintenance } from './entities/maintenance.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';
import { Response } from 'express';

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

    @Post(':id/maintenance')
    async addMaintenanceLog(
        @Param('id') id: string,
        @Body() createMaintenanceDto: CreateMaintenanceDto,
        @Request() req,
    ): Promise<VehicleMaintenance> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.addMaintenanceLog(id, createMaintenanceDto, organizationId);
    }

    @Get(':id/maintenance')
    async getMaintenanceHistory(
        @Param('id') id: string,
        @Request() req,
    ): Promise<VehicleMaintenance[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.getMaintenanceHistory(id, organizationId);
    }

    @Post(':id/documents')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
        @Param('id') id: string,
        @UploadedFile() file: any,
        @Body() createDocumentDto: CreateVehicleDocumentDto,
        @Request() req,
    ): Promise<VehicleDocument> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.saveDocumentMetadata(id, organizationId, file, createDocumentDto);
    }

    @Get(':id/documents')
    async getDocuments(
        @Param('id') id: string,
        @Request() req,
    ): Promise<VehicleDocument[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.vehicleService.getDocuments(id, organizationId);
    }

    @Get('documents/:documentId/download')
    async downloadDocument(
        @Param('documentId') documentId: string,
        @Request() req,
        @Res() res: Response,
    ) {
        const organizationId = req.headers['x-organization-id'];
        const doc = await this.vehicleService.getDocumentById(documentId, organizationId);
        res.download(doc.filePath, doc.fileName);
    }

    @Delete('documents/:documentId')
    async deleteDocument(
        @Param('documentId') documentId: string,
        @Request() req,
    ) {
        const organizationId = req.headers['x-organization-id'];
        await this.vehicleService.deleteDocument(documentId, organizationId);
        return { message: 'Document deleted successfully' };
    }
}
