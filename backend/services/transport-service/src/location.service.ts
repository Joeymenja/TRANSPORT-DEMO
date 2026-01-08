import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
    constructor(
        @InjectRepository(Location)
        private locationRepository: Repository<Location>,
    ) {}

    async findAll(organizationId: string): Promise<Location[]> {
        return this.locationRepository.find({
            where: { organizationId },
            order: { name: 'ASC' },
        });
    }

    async create(data: Partial<Location>, organizationId: string): Promise<Location> {
        const location = this.locationRepository.create({
            ...data,
            organizationId,
        });
        return this.locationRepository.save(location);
    }
}
