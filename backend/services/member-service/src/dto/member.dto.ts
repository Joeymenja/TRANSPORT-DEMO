import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { MobilityRequirement } from '../entities/member.entity';

export class CreateMemberDto {
    @IsString()
    memberId: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsDateString()
    dateOfBirth: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(MobilityRequirement)
    @IsOptional()
    mobilityRequirement?: MobilityRequirement;

    @IsString()
    @IsOptional()
    insuranceProvider?: string;

    @IsString()
    @IsOptional()
    insuranceId?: string;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    specialNotes?: string;
}

export class UpdateMemberDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsEnum(MobilityRequirement)
    @IsOptional()
    mobilityRequirement?: MobilityRequirement;

    @IsString()
    @IsOptional()
    insuranceProvider?: string;

    @IsString()
    @IsOptional()
    insuranceId?: string;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    specialNotes?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
