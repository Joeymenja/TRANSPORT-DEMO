import { IsEnum, IsString, IsOptional, IsObject, IsUUID } from 'class-validator';
import { NotificationType, NotificationStatus } from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsUUID()
    organizationId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsObject()
    metadata?: {
        driverId?: string;
        tripReportId?: string;
        tripId?: string;
        userId?: string;
        [key: string]: any;
    };
}

export class NotificationResponseDto {
    id: string;
    organizationId: string;
    type: NotificationType;
    title: string;
    message: string;
    status: NotificationStatus;
    metadata?: {
        driverId?: string;
        tripReportId?: string;
        tripId?: string;
        userId?: string;
        [key: string]: any;
    };
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export class MarkAsReadDto {
    @IsEnum(NotificationStatus)
    status: NotificationStatus;
}
