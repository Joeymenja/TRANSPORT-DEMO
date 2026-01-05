import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-logs')
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get()
    findAll(@Query('limit') limit: number) {
        return this.activityLogService.findAll(limit);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.activityLogService.markAsRead(id);
    }
}
