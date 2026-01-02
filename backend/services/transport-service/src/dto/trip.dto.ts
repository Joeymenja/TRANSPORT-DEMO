import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsDate, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { TripType, TripStatus } from '../entities/trip.entity';
import { StopType } from '../entities/trip-stop.entity';

export class CreateTripStopDto {
    @IsEnum(StopType)
    stopType: StopType;

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
    @IsUUID()
    memberId: string;

    @IsOptional()
    @IsUUID()
    pickupStopId?: string;

    @IsOptional()
    @IsUUID()
    dropoffStopId?: string;
}

export class CreateTripDto {
    @IsDate()
    @Type(() => Date)
    tripDate: Date;

    @IsOptional()
    @IsUUID()
    assignedDriverId?: string;

    @IsOptional()
    @IsUUID()
    assignedVehicleId?: string;

    @IsEnum(TripType)
    @IsOptional()
    tripType?: TripType;

    @IsBoolean()
    @IsOptional()
    isCarpool?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTripMemberDto)
    members: CreateTripMemberDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTripStopDto)
    stops: CreateTripStopDto[];
}

export class UpdateTripDto {
    @IsOptional()
    @IsUUID()
    assignedDriverId?: string;

    @IsOptional()
    @IsUUID()
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
    memberCount: number;
    stops: any[];
    members: any[];
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
}
