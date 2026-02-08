import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {

    constructor(
        private readonly reportService: ReportService
    ) { }

    @Get(':tripId')
    getReport(@Param('tripId') tripId: string) {
        return this.reportService.getReportByTripId(tripId);
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
