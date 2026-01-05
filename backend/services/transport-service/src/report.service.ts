import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripReport, TripReportStatus } from './entities/trip-report.entity';
import { Signature, SignatureType } from './entities/signature.entity';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { PdfService } from './pdf.service';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from './entities/activity-log.entity';

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
        private pdfService: PdfService,
        private activityLogService: ActivityLogService
    ) { }

    async createReport(tripId: string, data: Partial<TripReport>): Promise<TripReport> {
        const trip = await this.tripRepository.findOne({ where: { id: tripId } });
        if (!trip) throw new NotFoundException('Trip not found');

        const report = this.tripReportRepository.create({
            ...data,
            tripId,
            status: TripReportStatus.DRAFT
        });

        return this.tripReportRepository.save(report);
    }

    async getReportByTripId(tripId: string): Promise<TripReport> {
        return this.tripReportRepository.findOne({
            where: { tripId },
            relations: ['signatures', 'tripMember']
        });
    }

    async addSignature(reportId: string, data: {
        type: SignatureType,
        signerName: string,
        signatureUrl: string,
        metadata?: any
    }): Promise<Signature> {
        const report = await this.tripReportRepository.findOne({ where: { id: reportId } });
        if (!report) throw new NotFoundException('Report not found');

        const signature = this.signatureRepository.create({
            ...data,
            tripReportId: reportId
        });

        return this.signatureRepository.save(signature);
    }

    async submitReport(reportId: string): Promise<TripReport> {
        const report = await this.tripReportRepository.findOne({ where: { id: reportId } });
        if (!report) throw new NotFoundException('Report not found');

        report.status = TripReportStatus.SUBMITTED;
        // Logic to update Trip status to FINALIZED or COMPLETED could go here

        const savedReport = await this.tripReportRepository.save(report);

        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Report submitted for Trip #${report.tripId.slice(0, 8)}`,
            { tripId: report.tripId, reportId: report.id }
        );

        return savedReport;
    }

    async generatePdf(tripId: string): Promise<Buffer> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId },
            relations: ['assignedDriver', 'assignedDriver.user', 'members', 'members.member', 'pickupStops', 'dropoffStops']
        });
        if (!trip) throw new NotFoundException('Trip not found');

        const report = await this.getReportByTripId(tripId);

        return this.pdfService.generateTripReportPdf(trip, report);
    }
}
