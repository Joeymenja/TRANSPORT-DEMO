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
import { NotificationService } from './notification.service';
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
        const report = await this.tripReportRepository.findOne({
            where: { id: reportId },
            relations: ['trip', 'trip.assignedDriver', 'trip.assignedDriver.user']
        });
        if (!report) throw new NotFoundException('Report not found');

        report.status = TripReportStatus.SUBMITTED;
        report.submittedAt = new Date();

        const savedReport = await this.tripReportRepository.save(report);

        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Report submitted for Trip #${report.tripId.slice(0, 8)}`,
            { tripId: report.tripId, reportId: report.id }
        );

        // Get driver name for notification
        const driverName = report.trip?.assignedDriver?.user
            ? `${report.trip.assignedDriver.user.firstName} ${report.trip.assignedDriver.user.lastName}`
            : 'Unknown Driver';

        // Notify admin about trip report submission
        await this.notificationService.notifyTripReportSubmitted(
            report.organizationId,
            report.id,
            report.tripId,
            driverName
        );

        // If incident was reported, send urgent notification
        if (report.incidentReported) {
            await this.notificationService.notifyIncidentReported(
                report.organizationId,
                report.id,
                report.tripId,
                driverName
            );
        }

        return savedReport;
    }

    async createAndSubmitReport(tripId: string, driverId: string, reportData: {
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
    }): Promise<TripReport> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId },
            relations: ['tripMembers', 'assignedDriver', 'assignedDriver.user']
        });
        if (!trip) throw new NotFoundException('Trip not found');

        // Get the first member (or could iterate for multi-member trips)
        const memberId = trip.tripMembers?.[0]?.memberId;

        // Calculate total miles
        const totalMiles = reportData.endOdometer - reportData.startOdometer;

        // Create the report
        const report = this.tripReportRepository.create({
            organizationId: trip.organizationId,
            tripId,
            memberId,
            driverId,
            startOdometer: reportData.startOdometer,
            endOdometer: reportData.endOdometer,
            totalMiles,
            pickupTime: reportData.pickupTime,
            dropoffTime: reportData.dropoffTime,
            notes: reportData.notes,
            serviceVerified: reportData.serviceVerified,
            clientArrived: reportData.clientArrived,
            incidentReported: reportData.incidentReported,
            incidentDescription: reportData.incidentDescription,
            passengerSignature: reportData.clientSignature,
            passengerSignedAt: reportData.clientSignature ? new Date() : null,
            refusedSignature: reportData.refusedSignature || false,
            refusalReason: reportData.refusalReason,
            driverAttestation: true,
            driverAttestedAt: new Date(),
            status: TripReportStatus.SUBMITTED,
            submittedAt: new Date(),
        });

        const savedReport = await this.tripReportRepository.save(report);

        // Save signature as separate entity if provided
        if (reportData.clientSignature && memberId) {
            await this.addSignature(savedReport.id, {
                type: SignatureType.CLIENT,
                signerName: trip.tripMembers[0]?.member?.firstName
                    ? `${trip.tripMembers[0].member.firstName} ${trip.tripMembers[0].member.lastName}`
                    : 'Client',
                signatureUrl: reportData.clientSignature,
                metadata: {
                    timestamp: new Date().toISOString(),
                }
            });
        }

        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Trip report submitted for Trip #${tripId.slice(0, 8)}`,
            { tripId, reportId: savedReport.id, driverId }
        );

        // Get driver name for notification
        const driverName = trip.assignedDriver?.user
            ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}`
            : 'Unknown Driver';

        // Notify admin
        await this.notificationService.notifyTripReportSubmitted(
            trip.organizationId,
            savedReport.id,
            tripId,
            driverName
        );

        // If incident reported, send urgent notification
        if (reportData.incidentReported) {
            await this.notificationService.notifyIncidentReported(
                trip.organizationId,
                savedReport.id,
                tripId,
                driverName
            );
        }

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
