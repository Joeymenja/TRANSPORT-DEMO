import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TripService } from './trip.service';
import { PdfService } from './pdf.service';
import { ReportService } from './report.service';
import { CreateTripDto, UpdateTripDto, TripResponseDto, UpdateStopDto, MemberSignatureDto, CancelTripDto, MarkNoShowDto } from './dto/trip.dto';
import { Response } from 'express';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripController {
    constructor(
        private readonly tripService: TripService,
        private readonly pdfService: PdfService,
        private readonly reportService: ReportService
    ) { }

    @Post()
    async createTrip(
        @Body() createTripDto: CreateTripDto,
        @Request() req,
    ): Promise<TripResponseDto> {
        // TODO: Extract from JWT
        console.log('Create Trip Headers:', req.headers);
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];

        return this.tripService.createTrip(createTripDto, organizationId, userId);
    }

    @Post('demo')
    async createDemoTrip(
        @Body() body: { driverId: string, organizationId: string },
        @Request() req,
    ): Promise<TripResponseDto> {
        console.log('Creating demo trip:', body);
        const headerOrgId = req.headers['x-organization-id'];
        // Use body orgId if provided (for testing) or header
        const organizationId = body.organizationId || headerOrgId;
        return this.tripService.createDemoTrip(body.driverId, organizationId);
    }

    @Post('bulk')
    async createTripsBulk(
        @Body() createTripDtos: CreateTripDto[],
        @Request() req,
    ): Promise<TripResponseDto[]> {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];

        return this.tripService.createTripsBulk(createTripDtos, organizationId, userId);
    }

    @Get(':id')
    async getTripById(
        @Param('id') id: string,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.getTripById(id, organizationId);
    }

    @Get()
    async getTrips(
        @Query('date') date: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('memberId') memberId: string,
        @Request() req,
    ): Promise<TripResponseDto[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.getTrips(organizationId, {
            date: date ? new Date(date) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            memberId,
        });
    }

    @Get('driver/:driverId')
    async getDriverTrips(
        @Param('driverId') driverId: string,
        @Request() req,
    ): Promise<TripResponseDto[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.getDriverTrips(driverId, organizationId);
    }

    @Put(':id')
    async updateTrip(
        @Param('id') id: string,
        @Body() updateTripDto: UpdateTripDto,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.updateTrip(id, updateTripDto, organizationId);
    }

    @Post(':id/start')
    async startTrip(
        @Param('id') id: string,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.startTrip(id, organizationId);
    }

    @Get(':id/report')
    async getReport(@Param('id') id: string, @Res() res: Response) {
        try {
            // Generate report on-demand to ensure latest format and data
            const filePath = await this.tripService.generateReportForTrip(id);
            
            if (!require('fs').existsSync(filePath)) {
                return res.status(404).send('Report file could not be generated');
            }

            const buffer = require('fs').readFileSync(filePath);
            
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=trip-report-${id}.pdf`,
                'Content-Length': buffer.length,
            });

            res.end(buffer);
        } catch (e) {
             console.error('Error generating/serving report:', e);
             res.status(500).send('Error generating report');
        }
    }

    @Post(':id/report/submit')
    @UseInterceptors(FileInterceptor('pdf'))
    async submitReport(
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFile() pdf: Express.Multer.File,
        @Request() req
    ) {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
        
        // Parse reportData from string if it came as form-data
        let reportPayload = body;
        if (body.reportData && typeof body.reportData === 'string') {
            try {
                reportPayload = JSON.parse(body.reportData);
            } catch (e) {
                console.error('Failed to parse reportData JSON', e);
            }
        }

        // Save PDF if present
        if (pdf) {
            console.log('Received PDF in submitReport:', { 
                originalname: pdf.originalname, 
                mimetype: pdf.mimetype, 
                size: pdf.size, 
                hasBuffer: !!pdf.buffer,
                path: pdf.path 
            });

            const fs = require('fs');
            const path = require('path');
            const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filename = `trip-report-${id}-${Date.now()}.pdf`;
            const filePath = path.join(uploadDir, filename);
            
            if (pdf.buffer) {
                fs.writeFileSync(filePath, pdf.buffer);
            } else if (pdf.path) {
                // If using DiskStorage or temp file, copy/move it
                fs.copyFileSync(pdf.path, filePath);
            } else {
                console.error('Uploaded PDF has no buffer or path');
                // Even with no PDF file saved, we might want to proceed with just data? 
                // Or throw error? For now, let's proceed but warn.
            }

            // Add path to payload if file was written
            if (fs.existsSync(filePath)) {
                reportPayload = { ...reportPayload, pdfPath: filePath };
            }
        } else {
            console.log('No PDF file received in submitReport');
        }
        
        return this.tripService.submitReport(id, organizationId, userId, reportPayload);
    }

    @Post(':id/report/verify')
    async verifyReport(
        @Param('id') id: string,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
        return this.tripService.verifyReport(id, userId, organizationId);
    }

    @Post(':id/report/reject')
    async rejectReport(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
        return this.tripService.rejectReport(id, reason, userId, organizationId);
    }

    @Post(':id/complete')
    async completeTrip(
        @Param('id') id: string,
        @Request() req,
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.completeTrip(id, organizationId);
    }

    @Post(':tripId/members/:memberId/ready')
    async markMemberReady(
        @Param('tripId') tripId: string,
        @Param('memberId') memberId: string,
        @Request() req,
    ): Promise<{ message: string }> {
        const organizationId = req.headers['x-organization-id'];
        await this.tripService.markMemberReady(tripId, memberId, organizationId);
        return { message: 'Member marked as ready for pickup' };
    }

    @Post(':tripId/stops/:stopId/arrive')
    async arriveAtStop(
        @Param('tripId') tripId: string,
        @Param('stopId') stopId: string,
        @Body() updateStopDto: UpdateStopDto,
        @Request() req,
    ) {
        const organizationId = req.headers['x-organization-id'];
        const gps = updateStopDto.gpsLatitude && updateStopDto.gpsLongitude
            ? { lat: updateStopDto.gpsLatitude, lng: updateStopDto.gpsLongitude }
            : undefined;
        return this.tripService.arriveAtStop(tripId, stopId, organizationId, gps);
    }

    @Post(':tripId/members/:memberId/signature')
    async saveSignature(
        @Param('tripId') tripId: string,
        @Param('memberId') memberId: string,
        @Body() signatureDto: MemberSignatureDto,
        @Request() req,
    ) {
        const organizationId = req.headers['x-organization-id'];
        await this.tripService.saveMemberSignature(tripId, memberId, organizationId, signatureDto);
        return { message: 'Signature saved successfully' };
    }

    @Post(':tripId/stops/:stopId/complete')
    async completeStop(
        @Param('tripId') tripId: string,
        @Param('stopId') stopId: string,
        @Body() updateStopDto: UpdateStopDto,
        @Request() req,
    ) {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.completeStop(tripId, stopId, organizationId, updateStopDto.odometerReading);
    }

    @Post(':id/cancel')
    async cancelTrip(
        @Param('id') id: string,
        @Body() cancelDto: CancelTripDto,
        @Request() req
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
        return this.tripService.cancelTrip(id, organizationId, userId, cancelDto);
    }

    @Post(':id/no-show')
    async markNoShow(
        @Param('id') id: string,
        @Body() noShowDto: MarkNoShowDto,
        @Request() req
    ): Promise<TripResponseDto> {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
        return this.tripService.markNoShow(id, organizationId, userId, noShowDto);
    }
}
