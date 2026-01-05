import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsDate, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TripType, TripStatus, MobilityRequirement } from '../entities/trip.entity';
import { StopType } from '../entities/trip-stop.entity';

export class CreateTripStopDto {
    @IsString()
    stopType: string;

    @IsNumber()
    stopOrder: number;

    @IsString()
    address: string;

    @IsOptional()
    @IsNumber()
    gpsLatitude?: number;

    @IsOptional()
    @IsNumber()
    gpsLongitude?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    scheduledTime?: Date;
}

export class CreateTripMemberDto {
    @IsString()
    memberId: string;

    @IsOptional()
    @IsString()
    pickupStopId?: string;

    @IsOptional()
    @IsString()
    dropoffStopId?: string;
}

export class CreateTripDto {
    @IsDate()
    @Type(() => Date)
    tripDate: Date;

    @IsOptional()
    @IsString()
    assignedDriverId?: string;

    @IsOptional()
    @IsString()
    assignedVehicleId?: string;

    @IsString()
    @IsOptional()
    tripType?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsBoolean()
    @IsOptional()
    isCarpool?: boolean;

    @IsString()
    @IsOptional()
    reasonForVisit?: string;

    @IsString()
    @IsOptional()
    escortName?: string;

    @IsString()
    @IsOptional()
    escortRelationship?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTripMemberDto)
    members: CreateTripMemberDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTripStopDto)
    stops: CreateTripStopDto[];

    @IsEnum(MobilityRequirement)
    @IsOptional()
    mobilityRequirement?: MobilityRequirement;
}

export class UpdateTripDto {
    @IsOptional()
    @IsString()
    assignedDriverId?: string;

    @IsOptional()
    @IsString()
    assignedVehicleId?: string;

    @IsOptional()
    @IsEnum(TripStatus)
    status?: TripStatus;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startedAt?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    completedAt?: Date;

    @IsOptional()
    @IsOptional()
    @IsString()
    reportStatus?: string;

    @IsOptional()
    @IsString()
    reportRejectionReason?: string;

    @IsOptional()
    @IsEnum(MobilityRequirement)
    mobilityRequirement?: MobilityRequirement;

}

export class TripResponseDto {
    id: string;
    organizationId: string;
    tripDate: Date;
    assignedDriverId: string;
    assignedVehicleId: string;
    tripType: TripType;
    isCarpool: boolean;
    status: TripStatus;
    reasonForVisit?: string;
    escortName?: string;
    escortRelationship?: string;
    reportStatus?: string;
    reportFilePath?: string;
    reportRejectionReason?: string;
    reportVerifiedAt?: Date;
    reportVerifiedBy?: string;
    memberCount: number;
    stops: any[];
    members: any[];
    mobilityRequirement: MobilityRequirement;
    createdAt: Date;
}
export class UpdateStopDto {
    @IsOptional()
    @IsNumber()
    odometerReading?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    actualArrivalTime?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    actualDepartureTime?: Date;

    @IsOptional()
    @IsNumber()
    gpsLatitude?: number;

    @IsOptional()
    @IsNumber()
    gpsLongitude?: number;
}

export class MemberSignatureDto {
    @IsString()
    signatureBase64: string;


    @IsOptional()
    @IsBoolean()
    isProxySignature?: boolean;

    @IsOptional()
    @IsString()
    proxySignerName?: string;

    @IsOptional()
    @IsString()
    proxyRelationship?: string;

    @IsOptional()
    @IsString()
    proxyReason?: string;
}

export class CancelTripDto {
    @IsEnum(['MEMBER_CANCELLED', 'NO_SHOW', 'WEATHER', 'VEHICLE_ISSUE', 'DRIVER_UNAVAILABLE', 'OTHER'])
    reason: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class MarkNoShowDto {
    @IsString()
    notes: string;

    @IsOptional()
    @IsBoolean()
    attemptedContact?: boolean;
}
