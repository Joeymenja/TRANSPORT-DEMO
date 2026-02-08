import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripReport, TripReportStatus } from './entities/trip-report.entity';
import { Signature, SignatureType } from './entities/signature.entity';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { Driver } from './entities/driver.entity';
import { PdfService } from './pdf.service';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from './entities/activity-log.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(TripReport)
        private tripReportRepository: Repository<TripReport>,
        @InjectRepository(Signature)
        private signatureRepository: Repository<Signature>,
        @InjectRepository(Trip)
        private tripRepository: Repository<Trip>,
        @InjectRepository(TripMember)
        private tripMemberRepository: Repository<TripMember>,
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        private pdfService: PdfService,
        private activityLogService: ActivityLogService,
        private notificationService: NotificationService,
    ) { }

    private readonly logger = new Logger(ReportService.name);

    async getReportByTripId(tripId: string): Promise<TripReport> {
        return this.tripReportRepository.findOne({
            where: { tripId },
            relations: ['signatures', 'tripMember']
        });
    }

    async generatePdf(tripId: string): Promise<Buffer> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId },
            relations: ['assignedDriver', 'assignedDriver.user', 'members', 'members.member', 'pickupStops', 'dropoffStops']
        });
        if (!trip) throw new NotFoundException('Trip not found');

        const report = await this.getReportByTripId(tripId);

        return this.pdfService.readPdf(report.pdfFilePath);
    }
}

