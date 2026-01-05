import { IsEmail, IsString, MinLength, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsUUID()
    organizationId: string;

    @IsString()
    @IsOptional()
    phone?: string;
}

export class DriverRegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    licenseNumber: string;

    @IsString()
    @IsOptional()
    licenseState?: string;

    @IsString()
    @IsOptional()
    vehiclePlate?: string;
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    dob?: string; // YYYY-MM-DD

    @IsString()
    @IsOptional()
    addressStreet?: string;

    @IsString()
    @IsOptional()
    addressUnit?: string;

    @IsString()
    @IsOptional()
    addressCity?: string;

    @IsString()
    @IsOptional()
    addressState?: string;

    @IsString()
    @IsOptional()
    addressZip?: string;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    emergencyContactRelationship?: string;

    @IsString()
    @IsOptional()
    profilePhotoUrl?: string;
}

export class UploadDocumentDto {
    @IsEnum(['LICENSE', 'INSURANCE', 'BACKGROUND_CHECK'])
    documentType: string;

    @IsString()
    fileUrl: string;

    @IsString()
    @IsOptional()
    expiryDate?: string;
}

export class ReviewDocumentDto {
    @IsEnum(['APPROVED', 'REJECTED'])
    status: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class AuthResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        organizationId: string;
        onboardingStep: number;
    };
}
