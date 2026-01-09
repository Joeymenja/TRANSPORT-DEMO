import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TripService } from './trip.service';
import { PdfService } from './pdf.service';
import { ReportService } from './report.service';
import { CreateTripDto, UpdateTripDto, TripResponseDto, UpdateStopDto, MemberSignatureDto, CancelTripDto, MarkNoShowDto } from './dto/trip.dto';
import { Response } from 'express';

// Simple auth guard that extracts user from header (will be replaced with real JWT guard)
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
        const trip = await this.tripService.findOne(id);
        
        if (!trip.reportFilePath) {
            // Fallback: Generate it on the fly if verified data available? 
            // Or 404. Let's try to generate if missing but data exists in TripReport table.
             // For now, 404 if no physical file or generation logic path.
             // But actually, the previous implementation TRIED to generate it on the fly.
        }

        try {
            const buffer = await this.pdfService.readPdf(trip.reportFilePath || ''); 
            
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=trip-report-${id}.pdf`,
                'Content-Length': buffer.length,
            });

            res.end(buffer);
        } catch (e) {
             // If read fails (e.g. file deleted), return 404
             res.status(404).send('Report not found');
        }
    }

    @Post(':id/report/submit')
    async submitReport(
        @Param('id') id: string,
        @Body() reportPayload: { tripData: any, signatureData: any },
        @Request() req
    ) {
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];
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
