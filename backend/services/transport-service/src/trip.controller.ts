import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards, Res } from '@nestjs/common';
import { TripService } from './trip.service';
import { PdfService } from './pdf.service';
import { CreateTripDto, UpdateTripDto, TripResponseDto, UpdateStopDto, MemberSignatureDto, CancelTripDto, MarkNoShowDto } from './dto/trip.dto';
import { Response } from 'express';

// Simple auth guard that extracts user from header (will be replaced with real JWT guard)
@Controller('trips')
export class TripController {
    constructor(
        private readonly tripService: TripService,
        private readonly pdfService: PdfService
    ) { }

    @Post()
    async createTrip(
        @Body() createTripDto: CreateTripDto,
        @Request() req,
    ): Promise<TripResponseDto> {
        // TODO: Extract from JWT
        const organizationId = req.headers['x-organization-id'];
        const userId = req.headers['x-user-id'];

        return this.tripService.createTrip(createTripDto, organizationId, userId);
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
        @Request() req,
    ): Promise<TripResponseDto[]> {
        const organizationId = req.headers['x-organization-id'];
        return this.tripService.getTrips(organizationId, {
            date: date ? new Date(date) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
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
        const buffer = await this.pdfService.generateTripReport(trip);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=trip-report-${id}.pdf`,
            'Content-Length': buffer.length,
        });

        res.end(buffer);
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
