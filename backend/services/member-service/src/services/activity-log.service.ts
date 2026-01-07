import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async log(type: ActivityType, message: string, organizationId: string, metadata?: any): Promise<ActivityLog> {
        const log = this.activityLogRepository.create({
            type,
            message,
            metadata,
            organizationId
        });
        return this.activityLogRepository.save(log);
    }
}
