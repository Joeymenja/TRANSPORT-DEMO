import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) {}

    async create(
        organizationId: string,
        type: NotificationType,
        title: string,
        message: string,
        metadata?: any,
    ): Promise<Notification> {
        const notification = this.notificationRepository.create({
            organizationId,
            type,
            title,
            message,
            metadata,
            status: NotificationStatus.UNREAD,
        });

        return this.notificationRepository.save(notification);
    }

    async findAll(organizationId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { organizationId },
            order: { createdAt: 'DESC' },
        });
    }

    async findUnread(organizationId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
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

        if (notification) {
            notification.status = NotificationStatus.READ;
            notification.readAt = new Date();
            return this.notificationRepository.save(notification);
        }

        return notification;
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

    // Helper method to notify admin about pending driver
    async notifyPendingDriver(
        organizationId: string,
        driverId: string,
        driverName: string,
    ): Promise<Notification> {
        return this.create(
            organizationId,
            NotificationType.DRIVER_PENDING,
            'New Driver Pending Approval',
            `${driverName} has registered and is awaiting approval.`,
            { driverId },
        );
    }

    // Helper method to notify admin about trip report submission
    async notifyTripReportSubmitted(
        organizationId: string,
        tripReportId: string,
        tripId: string,
        driverName: string,
    ): Promise<Notification> {
        return this.create(
            organizationId,
            NotificationType.TRIP_REPORT_SUBMITTED,
            'Trip Report Submitted',
            `${driverName} has submitted a trip report for review.`,
            { tripReportId, tripId },
        );
    }

    // Helper method to notify admin about incident
    async notifyIncidentReported(
        organizationId: string,
        tripReportId: string,
        tripId: string,
        driverName: string,
    ): Promise<Notification> {
        return this.create(
            organizationId,
            NotificationType.INCIDENT_REPORTED,
            'Incident Reported',
            `${driverName} reported an incident in trip report. Please review immediately.`,
            { tripReportId, tripId },
        );
    }
}
