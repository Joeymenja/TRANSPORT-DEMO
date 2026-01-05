import { Controller, Get, Patch, Param, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async getAll(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.notificationService.findAll(organizationId);
    }

    @Get('unread')
    async getUnread(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.notificationService.findUnread(organizationId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Patch('read-all')
    async markAllAsRead(@Request() req) {
        const organizationId = req.headers['x-organization-id'];
        await this.notificationService.markAllAsRead(organizationId);
        return { message: 'All notifications marked as read' };
    }
}
