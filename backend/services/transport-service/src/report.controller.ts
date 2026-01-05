import { Controller, Get, Post, Body, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { TripReport } from './entities/trip-report.entity';
import { SignatureType } from './entities/signature.entity';

@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

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
    createAndSubmitReport(
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
        return this.reportService.createAndSubmitReport(tripId, body.driverId, {
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
