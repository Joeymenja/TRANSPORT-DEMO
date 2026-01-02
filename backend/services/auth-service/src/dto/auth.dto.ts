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
    @MinLength(6)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsOptional()
    phone?: string;
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
    };
}
