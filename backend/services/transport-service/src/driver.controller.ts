import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Post()
    create(
        @Body() createDriverDto: CreateDriverDto,
        @Headers('x-organization-id') organizationId: string
    ) {
        return this.driverService.createDriver(createDriverDto, organizationId);
    }

    @Get()
    findAll(@Headers('x-organization-id') organizationId: string) {
        return this.driverService.findAll(organizationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driverService.findOne(id);
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        return this.driverService.findByUserId(userId);
    }

    // Must be before :id to avoid conflict
    @Patch('me/status')
    updateStatus(
        @Body() body: { driverId: string, status: string, lat?: number, lng?: number }
    ) {
        // In a real app, we extract driverId from the JWT user. 
        // For this demo, we trust the body or would lookup via userId from header.
        // Let's require driverId in body for simplicity now.
        return this.driverService.updateStatus(body.driverId, body.status, body.lat, body.lng);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
        return this.driverService.update(id, updateDriverDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.driverService.remove(id);
    }

    @Patch('profile/signature')
    updateSignature(@Body() body: { userId: string, signatureUrl: string }) {
        // In real app, get userId from JWT
        return this.driverService.updateSignature(body.userId, body.signatureUrl);
    }
}
