import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
    ) { }

    async findOne(id: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({ where: { id } });
        if (!organization) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        return organization;
    }

    async update(id: string, updateDto: UpdateOrganizationDto): Promise<Organization> {
        const organization = await this.findOne(id);
        
        // Merge updates
        Object.assign(organization, updateDto);
        
        return this.organizationRepository.save(organization);
    }
}
