import { Controller, Get, Param, Patch, Query, Request } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-logs')
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get()
    findAll(@Query('limit') limit: number, @Request() req) {
        const organizationId = req.headers['x-organization-id'];
        return this.activityLogService.findAll(organizationId, limit);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.activityLogService.markAsRead(id);
    }
}
