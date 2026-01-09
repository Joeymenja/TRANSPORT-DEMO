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
            // Map entities to flat data for PDF
            const tripMember = trip.tripMembers?.[0]?.member;
            const driverUser = trip.assignedDriver?.user;
            const vehicle = trip.assignedDriver?.assignedVehicle || trip.assignedVehicle; 
            
            // Extract stop data
            const pickupStop = trip.tripStops?.find(s => s.stopType === 'PICKUP') || trip.tripStops?.[0];
            const dropoffStop = trip.tripStops?.find(s => s.stopType === 'DROPOFF') || trip.tripStops?.[trip.tripStops?.length - 1];

            const tripData = {
                id: trip.id,
                driverId: trip.assignedDriverId,
                driverName: driverUser ? `${driverUser.firstName} ${driverUser.lastName}` : '',
                vehicleId: vehicle?.vehicleNumber || 'N/A',
                vehicleColor: vehicle?.color || '',
                vehicleMake: vehicle?.make || '',
                vehicleType: vehicle?.vehicleType || 'Wheelchair Van',
                memberAhcccsId: tripMember?.memberId || '', // memberId IS the AHCCCS ID
                memberDOB: tripMember?.dateOfBirth ? new Date(tripMember.dateOfBirth).toLocaleDateString() : '',
                memberName: tripMember ? `${tripMember.firstName} ${tripMember.lastName}` : '',
                memberAddress: tripMember?.address || '',
                pickupAddress: pickupStop?.address || '',
                pickupTime: report.pickupTime ? new Date(report.pickupTime).toISOString() : pickupStop?.scheduledTime?.toISOString(),
                startOdometer: report.startOdometer,
                dropoffAddress: dropoffStop?.address || '',
                dropoffTime: report.dropoffTime ? new Date(report.dropoffTime).toISOString() : dropoffStop?.scheduledTime?.toISOString(),
                endOdometer: report.endOdometer,
                reasonForVisit: trip.reasonForVisit || 'Medical',
                additionalInfo: report.notes || ''
            };

            const signatureData = {
                member: report.passengerSignature,
                // Driver signature might be stored in a separate column or relation in future, 
                // but for now relying on what's available. If it's not in report, pass empty.
                driver: undefined // Update this if driver signature is stored in report entity
            };

            // generateOfficialReport saves to disk and returns path
            pdfFilePath = await this.pdfService.generateOfficialReport(tripData, signatureData);
            
        } catch (error) {
            console.error(`[ReportService] Error generating PDF for trip ${trip.id}:`, error);
        }

        // Store PDF path in report
        if (pdfFilePath) {
            report.pdfFilePath = pdfFilePath;
        }

        const savedReport = await this.tripReportRepository.save(report);

        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Report submitted for Trip #${report.tripId.slice(0, 8)}`,
            trip.organizationId,
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

        return this.pdfService.readPdf(report.pdfFilePath);
    }
}
