import { Controller, Get, Patch, Param, Query, UseGuards, Req, Post, Body, Inject } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DriverService } from './driver.service';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly driverService: DriverService
    ) {}

    // Public endpoint for service-to-service communication (e.g., auth-service creating notifications)
    @Post()
    async create(@Body() createDto: CreateNotificationDto): Promise<Notification> {
        return await this.notificationService.create(createDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll(@Req() req, @Query('status') status?: NotificationStatus): Promise<Notification[]> {
        const organizationId = req.user.organizationId;
        const notifications = await this.notificationService.findAll(organizationId, status);

        if (req.user.role === 'DRIVER') {
            try {
                const driver = await this.driverService.findByUserId(req.user.userId);
                // Filter notifications where metadata.driverId matches, OR metadata.userId matches, OR no specific target (broadcast)
                // Strict "Updates" implementation: only things specifically for this driver
                return notifications.filter(n => {
                    const metaDriverId = n.metadata?.driverId;
                    const metaUserId = n.metadata?.userId;
                    
                    // Specific targeting
                    if (metaDriverId && metaDriverId === driver.id) return true;
                    if (metaUserId && metaUserId === req.user.userId) return true;
                    
                    // If no target specified, maybe it's a general announcement? 
                    // For now, strict filtering to reduce noise as requested.
                    return false;
                });
            } catch (e) {
                // If driver profile not found, return empty or all? standard safer to return empty
                return [];
            }
        }

        return notifications;
    }

    @Get('unread')
    @UseGuards(JwtAuthGuard)
    async getUnread(@Req() req): Promise<Notification[]> {
        const organizationId = req.user.organizationId;
        return await this.notificationService.findUnread(organizationId);
    }

    @Patch(':id/read')
    @UseGuards(JwtAuthGuard)
    async markAsRead(@Param('id') id: string): Promise<Notification> {
        return await this.notificationService.markAsRead(id);
    }

    @Patch('read-all')
    @UseGuards(JwtAuthGuard)
    async markAllAsRead(@Req() req): Promise<{ message: string }> {
        const organizationId = req.user.organizationId;
        await this.notificationService.markAllAsRead(organizationId);
        return { message: 'All notifications marked as read' };
    }
}
