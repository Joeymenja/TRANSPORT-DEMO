import { Controller, Get, Patch, Param, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification, NotificationStatus } from './entities/notification.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/notification.dto';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    // Public endpoint for service-to-service communication (e.g., auth-service creating notifications)
    @Post()
    async create(@Body() createDto: CreateNotificationDto): Promise<Notification> {
        return await this.notificationService.create(createDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll(@Req() req, @Query('status') status?: NotificationStatus): Promise<Notification[]> {
        const organizationId = req.user.organizationId;
        return await this.notificationService.findAll(organizationId, status);
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
