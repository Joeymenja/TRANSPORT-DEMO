import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from './entities/activity-log.entity';

@Injectable()
export class DriverService {
    constructor(
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private activityLogService: ActivityLogService,
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

        const savedDriver = await this.driverRepository.save(driver);
        await this.activityLogService.log(
            ActivityType.DRIVER_REGISTERED,
            `New driver registered: ${user.firstName} ${user.lastName}`,
            organizationId,
            { driverId: savedDriver.id, userId: user.id }
        );
        return savedDriver;
    }

    async findAll(organizationId: string): Promise<Driver[]> {
        // Query drivers and join with User to get names
        return this.driverRepository.find({
            relations: ['user', 'assignedVehicle'],
            // In a real app, filter by organizationId
        });
    }

    async findPending(organizationId: string): Promise<Driver[]> {
        return this.driverRepository.find({
            where: { isActive: false },
            relations: ['user', 'assignedVehicle'],
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

        const savedDriver = await this.driverRepository.save(driver);
        
        await this.activityLogService.log(
            ActivityType.DRIVER_STATUS_CHANGED,
            `Driver ${driver.user?.firstName} ${driver.user?.lastName} status changed to ${status}`,
            driver.organizationId,
            { driverId: driver.id, status, lat, lng }
        );

        return savedDriver;
    }

    async updateSignature(userId: string, signatureUrl: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.signatureUrl = signatureUrl;
        user.signatureUrl = signatureUrl;
        const savedUser = await this.userRepository.save(user);

        // We need organizationId but User entity might not have it loaded cleanly or we rely on the context.
        // But here we only have userId. Let's fetch the driver profile to get Org ID, or use user.organizationId if we had it.
        // The earlier findOne didn't load relations. Let's assume user.organizationId is present.
        
        if (user.organizationId) {
             await this.activityLogService.log(
                ActivityType.SYSTEM,
                `Driver ${user.firstName} ${user.lastName} updated signature`,
                user.organizationId,
                { userId: user.id }
            );
        }
        
        return savedUser;
    }

    async remove(id: string): Promise<void> {
        await this.driverRepository.delete(id);
    }
}
