import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
    constructor(private readonly locationService: LocationService) {}

    @Get()
    async findAll(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.locationService.findAll(organizationId);
    }

    @Post()
    async create(@Body() body: any, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.locationService.create(body, organizationId);
    }
}
