import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DocumentType } from '../entities/vehicle-document.entity';

export class CreateVehicleDocumentDto {
    @IsEnum(DocumentType)
    documentType: DocumentType;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
