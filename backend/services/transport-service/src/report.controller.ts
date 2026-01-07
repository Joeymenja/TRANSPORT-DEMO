import { Controller, Get, Post, Body, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { DriverService } from './driver.service';
import { TripReport } from './entities/trip-report.entity';
import { SignatureType } from './entities/signature.entity';

@Controller('reports')
export class ReportController {

    constructor(
        private readonly reportService: ReportService,
        private readonly driverService: DriverService
    ) { }

    @Post(':tripId')
    createReport(@Param('tripId') tripId: string, @Body() data: Partial<TripReport>) {
        return this.reportService.createReport(tripId, data);
    }

    @Get(':tripId')
    getReport(@Param('tripId') tripId: string) {
        return this.reportService.getReportByTripId(tripId);
    }

    @Post(':reportId/signatures')
    addSignature(
        @Param('reportId') reportId: string,
        @Body() body: { type: SignatureType; signerName: string; signatureUrl: string; metadata?: any }
    ) {
        return this.reportService.addSignature(reportId, body);
    }

    @Put(':reportId/submit')
    submitReport(@Param('reportId') reportId: string) {
        return this.reportService.submitReport(reportId);
    }

    @Post('trip/:tripId/submit')
    async createAndSubmitReport(
        @Param('tripId') tripId: string,
        @Body() body: {
            driverId: string;
            startOdometer: number;
            endOdometer: number;
            pickupTime: string;
            dropoffTime: string;
            notes?: string;
            serviceVerified: boolean;
            clientArrived: boolean;
            incidentReported: boolean;
            incidentDescription?: string;
            clientSignature?: string;
            refusedSignature?: boolean;
            refusalReason?: string;
        }
    ) {
        let driverId = body.driverId;
        // Attempt to resolve User ID to Driver ID
        try {
            const driver = await this.driverService.findByUserId(body.driverId);
            if (driver) {
                driverId = driver.id;
            }
        } catch (error) {
            // Ignore if not found via userId, assume it might be a driverId
            // or let the service fail if invalid
            console.log(`[ReportController] Could not resolve driver from userId ${body.driverId}, using generic fallback or original ID. Error: ${error.message}`);
        }

        return this.reportService.createAndSubmitReport(tripId, driverId, {
            ...body,
            pickupTime: new Date(body.pickupTime),
            dropoffTime: new Date(body.dropoffTime),
        });
    }

    @Get(':tripId/pdf')
    async downloadPdf(@Param('tripId') tripId: string, @Res() res: Response) {
        const buffer = await this.reportService.generatePdf(tripId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=trip-report-${tripId}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
