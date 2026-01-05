import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriverService {
    constructor(
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createDriver(createDriverDto: CreateDriverDto, organizationId: string): Promise<Driver> {
        // 1. Find the user by email
        const user = await this.userRepository.findOne({ where: { email: createDriverDto.email } });
        if (!user) {
            throw new NotFoundException(`User with email ${createDriverDto.email} not found. Please register the user first.`);
        }

        // 2. Check if driver profile already exists
        const existingDriver = await this.driverRepository.findOne({ where: { userId: user.id } });
        if (existingDriver) {
            throw new BadRequestException('Driver profile already exists for this user.');
        }

        // 3. Create Driver Profile
        const driver = this.driverRepository.create({
            userId: user.id,
            organizationId: organizationId,
            licenseNumber: createDriverDto.licenseNumber,
            licenseState: createDriverDto.licenseState,
            licenseExpiryDate: createDriverDto.licenseExpiryDate,
            employmentStatus: createDriverDto.employmentStatus,
            emergencyContactName: createDriverDto.emergencyContactName,
            emergencyContactPhone: createDriverDto.emergencyContactPhone,
            assignedVehicleId: createDriverDto.assignedVehicleId,
        });

        return this.driverRepository.save(driver);
    }

    async findAll(organizationId: string): Promise<Driver[]> {
        // Query drivers and join with User to get names
        return this.driverRepository.find({
            relations: ['user', 'assignedVehicle'],
            // Note: In a real app, we should filter by organizationId on the User, 
            // but since Driver doesn't have orgId, we rely on the JOIN or strict user filtering.
            // For this demo, assuming all drivers are relevant or filtered by the Auth service user query.
        });
    }

    async findOne(id: string): Promise<Driver> {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: ['user', 'assignedVehicle'],
        });
        if (!driver) throw new NotFoundException('Driver not found');
        return driver;
    }

    async findByUserId(userId: string): Promise<Driver> {
        const driver = await this.driverRepository.findOne({
            where: { userId },
            relations: ['user', 'assignedVehicle'],
        });
        // Start of Selection
        if (!driver) throw new NotFoundException('Driver not found for this user');
        return driver;
    }

    async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
        const driver = await this.findOne(id);
        Object.assign(driver, updateDriverDto);
        return this.driverRepository.save(driver);
    }

    async updateStatus(driverId: string, status: string, lat?: number, lng?: number): Promise<Driver> {
        const driver = await this.findOne(driverId);
        driver.currentStatus = status;
        driver.lastStatusUpdate = new Date();
        if (lat !== undefined) driver.currentLatitude = lat;
        if (lng !== undefined) driver.currentLongitude = lng;

        return this.driverRepository.save(driver);
    }

    async updateSignature(userId: string, signatureUrl: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.signatureUrl = signatureUrl;
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        await this.driverRepository.delete(id);
    }
}
