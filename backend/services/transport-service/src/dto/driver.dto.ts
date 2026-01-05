import { IsString, IsOptional, IsEnum, IsDateString, IsEmail } from 'class-validator';
import { EmploymentStatus } from '../entities/driver.entity';

export class CreateDriverDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    password?: string; // Optional, can be auto-generated

    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @IsString()
    @IsOptional()
    licenseState?: string;

    @IsDateString()
    @IsOptional()
    licenseExpiryDate?: string;

    @IsEnum(EmploymentStatus)
    @IsOptional()
    employmentStatus?: EmploymentStatus;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    assignedVehicleId?: string;
}

export class UpdateDriverDto {
    @IsString()
    @IsOptional()
    licenseNumber?: string;

    @IsString()
    @IsOptional()
    licenseState?: string;

    @IsDateString()
    @IsOptional()
    licenseExpiryDate?: string;

    @IsEnum(EmploymentStatus)
    @IsOptional()
    employmentStatus?: EmploymentStatus;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    assignedVehicleId?: string;
}
