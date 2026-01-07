import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async log(type: ActivityType, message: string, metadata?: any): Promise<ActivityLog> {
        // Try to extract organizationId from metadata if available (common pattern)
        const organizationId = metadata?.organizationId || metadata?.user?.organizationId;
        
        const log = this.activityLogRepository.create({
            type,
            message,
            metadata,
            organizationId
        });
        return this.activityLogRepository.save(log);
    }

    async findAll(organizationId: string, limit: number = 20): Promise<ActivityLog[]> {
        return this.activityLogRepository.find({
            where: { organizationId }, // Filter by Org ID
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async markAsRead(id: string): Promise<void> {
        await this.activityLogRepository.update(id, { isRead: true });
    }
}
