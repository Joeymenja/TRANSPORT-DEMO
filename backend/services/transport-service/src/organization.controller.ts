import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/organization.dto';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Get()
    async get(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.organizationService.findOne(organizationId);
    }

    @Put()
    async update(@Body() updateDto: UpdateOrganizationDto, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.organizationService.update(organizationId, updateDto);
    }
}
