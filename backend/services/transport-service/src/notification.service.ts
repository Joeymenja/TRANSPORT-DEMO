import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationDto, NotificationResponseDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    async create(createDto: CreateNotificationDto): Promise<Notification> {
        const notification = this.notificationRepository.create(createDto);
        return await this.notificationRepository.save(notification);
    }

    async findAll(organizationId: string, status?: NotificationStatus): Promise<Notification[]> {
        const query: any = { organizationId };

        if (status) {
            query.status = status;
        }

        return await this.notificationRepository.find({
            where: query,
            order: { createdAt: 'DESC' },
        });
    }

    async findUnread(organizationId: string): Promise<Notification[]> {
        return await this.notificationRepository.find({
            where: {
                organizationId,
                status: NotificationStatus.UNREAD,
            },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(id: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id },
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.status = NotificationStatus.READ;
        notification.readAt = new Date();

        return await this.notificationRepository.save(notification);
    }

    async markAllAsRead(organizationId: string): Promise<void> {
        await this.notificationRepository.update(
            {
                organizationId,
                status: NotificationStatus.UNREAD,
            },
            {
                status: NotificationStatus.READ,
                readAt: new Date(),
            },
        );
    }

    // Helper methods for creating specific notification types

    async createDriverPendingNotification(params: {
        organizationId: string;
        driverId: string;
        userId: string;
        driverName: string;
    }): Promise<Notification> {
        return await this.create({
            organizationId: params.organizationId,
            type: NotificationType.DRIVER_PENDING,
            title: 'New Driver Pending Approval',
            message: `${params.driverName} has registered and is awaiting approval`,
            metadata: {
                driverId: params.driverId,
                userId: params.userId,
            },
        });
    }

    async createTripReportSubmittedNotification(params: {
        organizationId: string;
        tripId: string;
        reportId: string;
        driverId?: string;
        driverName?: string;
    }): Promise<Notification> {
        const driverInfo = params.driverName ? ` by ${params.driverName}` : '';

        return await this.create({
            organizationId: params.organizationId,
            type: NotificationType.TRIP_REPORT_SUBMITTED,
            title: 'Trip Report Submitted',
            message: `A trip report has been submitted${driverInfo} and is ready for review`,
            metadata: {
                tripId: params.tripId,
                tripReportId: params.reportId,
                driverId: params.driverId,
            },
        });
    }

    async createIncidentReportedNotification(params: {
        organizationId: string;
        tripId: string;
        reportId: string;
        incidentDescription: string;
    }): Promise<Notification> {
        return await this.create({
            organizationId: params.organizationId,
            type: NotificationType.INCIDENT_REPORTED,
            title: 'Incident Reported',
            message: `An incident has been reported: ${params.incidentDescription.substring(0, 100)}${params.incidentDescription.length > 100 ? '...' : ''}`,
            metadata: {
                tripId: params.tripId,
                tripReportId: params.reportId,
            },
        });
    }

    async createTripCancelledNotification(params: {
        organizationId: string;
        tripId: string;
        cancelledBy: string;
        reason?: string;
    }): Promise<Notification> {
        const reasonText = params.reason ? `: ${params.reason}` : '';

        return await this.create({
            organizationId: params.organizationId,
            type: NotificationType.TRIP_CANCELLED,
            title: 'Trip Cancelled',
            message: `A trip has been cancelled by ${params.cancelledBy}${reasonText}`,
            metadata: {
                tripId: params.tripId,
            },
        });
    }

    toResponseDto(notification: Notification): NotificationResponseDto {
        return {
            id: notification.id,
            organizationId: notification.organizationId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            status: notification.status,
            metadata: notification.metadata,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }
}
