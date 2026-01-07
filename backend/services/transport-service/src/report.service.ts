import { Injectable, NotFoundException } from '@nestjs/common';
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

    async createReport(tripId: string, data: Partial<TripReport>): Promise<TripReport> {
        const trip = await this.tripRepository.findOne({ where: { id: tripId } });
        if (!trip) throw new NotFoundException('Trip not found');

        const report = this.tripReportRepository.create({
            ...data,
            tripId,
            organizationId: trip.organizationId,
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

        // Get trip and driver details for PDF generation and notification
        const trip = await this.tripRepository.findOne({
            where: { id: report.tripId },
            relations: ['assignedDriver', 'assignedDriver.user', 'tripMembers', 'tripMembers.member', 'tripStops']
        });

        if (!trip) throw new NotFoundException('Trip not found');

        // Generate PDF
        let pdfFilePath = null;
        try {
            const pdfBuffer = await this.pdfService.generateTripReportPdf(trip, report);
            // Save PDF to disk with organized folder structure
            pdfFilePath = await this.pdfService.savePdfToDisk(pdfBuffer, trip.tripDate, trip.id);
        } catch (error) {
            console.error(`[ReportService] Error generating PDF for trip ${trip.id}:`, error);
            // We continue even if PDF fails? Or throw?
            // If PDF fails, we probably shouldn't mark as submitted fully or should note it.
            // For now, let's allow it but log error.
        }

        // Store PDF path in report
        if (pdfFilePath) {
            report.pdfFilePath = pdfFilePath;
        }

        const savedReport = await this.tripReportRepository.save(report);

        // Log activity
        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Report submitted for Trip #${report.tripId.slice(0, 8)}`,
            { tripId: report.tripId, reportId: report.id, pdfPath: pdfFilePath }
        );

        const driverName = trip.assignedDriver?.user
            ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}`
            : undefined;

        // Create notification for admins
        try {
            await this.notificationService.createTripReportSubmittedNotification({
                organizationId: trip.organizationId,
                tripId: trip.id,
                reportId: savedReport.id,
                driverId: trip.assignedDriverId,
                driverName,
            });
        } catch (error) {
             console.error(`[ReportService] Error sending notification for trip ${trip.id}:`, error);
        }

        return savedReport;
    }

    async createAndSubmitReport(
        tripId: string,
        driverId: string,
        data: {
            startOdometer: number;
            endOdometer: number;
            pickupTime: Date;
            dropoffTime: Date;
            notes?: string;
            serviceVerified: boolean;
            clientArrived: boolean;
            incidentReported: boolean;
            incidentDescription?: string;
            clientSignature?: string;
            refusedSignature?: boolean;
            refusalReason?: string;
        }
    ): Promise<TripReport> {
        // Create the report
        const report = await this.createReport(tripId, {
            driverId,
            ...data,
        });

        // Add client signature if provided
        if (data.clientSignature) {
            await this.addSignature(report.id, {
                type: SignatureType.CLIENT,
                signerName: 'Client',
                signatureUrl: data.clientSignature,
            });
        }

        // Submit the report
        return this.submitReport(report.id);
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
