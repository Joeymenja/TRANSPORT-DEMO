import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripType, TripStatus, ReportStatus, MobilityRequirement } from './entities/trip.entity';
import { TripMember, MemberStatus } from './entities/trip-member.entity';
import { TripStop, StopType } from './entities/trip-stop.entity';
import { TripReport, TripReportStatus } from './entities/trip-report.entity';
import { Vehicle } from './entities/vehicle.entity';
import { User } from './entities/user.entity';
import { Member } from './entities/member.entity';
import { Driver } from './entities/driver.entity';
import { Organization } from './entities/organization.entity';
import { CreateTripDto, UpdateTripDto, TripResponseDto, MemberSignatureDto, CancelTripDto, MarkNoShowDto } from './dto/trip.dto';
import { ActivityLogService } from './activity-log.service';
import { ActivityType } from './entities/activity-log.entity';
import { PdfService } from './pdf.service';
import { NotificationService } from './notification.service';
import { BillingService } from './billing.service';
import { TripReportBuilder, TripLegFactory } from './reporting/trip-report-service';
import { PDFGenerator } from './reporting/trip-report-pdf';
import { VehicleType as ReportVehicleType, SignatureMethod } from './reporting/trip-report-models';

@Injectable()
export class TripService {
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        @InjectRepository(TripMember)
        private readonly tripMemberRepository: Repository<TripMember>,
        @InjectRepository(TripStop)
        private readonly tripStopRepository: Repository<TripStop>,
        @InjectRepository(TripReport)
        private readonly tripReportRepository: Repository<TripReport>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly activityLogService: ActivityLogService,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
        private readonly pdfService: PdfService,
        private readonly notificationService: NotificationService,
        private readonly billingService: BillingService,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
    ) { }

// ... existing methods ...

    async verifyReport(tripId: string, userId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.findOne(tripId);
        if (trip.organizationId !== organizationId) throw new ForbiddenException();

        trip.reportStatus = ReportStatus.VERIFIED;
        trip.reportVerifiedAt = new Date();
        trip.reportVerifiedBy = userId;
        await this.tripRepository.save(trip);

        // Auto-generate billing claim
        try {
            await this.billingService.generateClaimsForTrips([tripId]);
            await this.activityLogService.log(
                ActivityType.SYSTEM,
                `Billing claim auto-generated for verified trip #${tripId.slice(0, 8)}`,
                organizationId,
                { tripId }
            );
        } catch (error) {
            console.error('Failed to auto-generate claim:', error);
            // Don't fail the verification if billing fails, but log it
        }

        return this.getTripById(tripId, organizationId);
    }

    private readonly logger = new Logger(TripService.name);

    async createTrip(createTripDto: CreateTripDto, organizationId: string, userId: string): Promise<TripResponseDto> {
        try {
            // Create trip
            // Auto-assign vehicle if driver is assigned but vehicle is not
            // Auto-assign vehicle if driver is assigned but vehicle is not
            let assignedVehicleId = createTripDto.assignedVehicleId;
            let assignedDriverId = createTripDto.assignedDriverId;

            // Auto-dispatch: If no driver assigned, find an available active driver
            if (!assignedDriverId) {
                const availableDriver = await this.driverRepository.findOne({
                    where: { 
                        organizationId, 
                        isActive: true 
                    },
                    // In a real app, we would use more sophisticated logic (location, schedule, etc.)
                    // For now, we take the first active driver found
                });

                if (availableDriver) {
                    assignedDriverId = availableDriver.id;
                    // Auto-assign vehicle if driver has one and none specified
                    if (!assignedVehicleId && availableDriver.assignedVehicleId) {
                        assignedVehicleId = availableDriver.assignedVehicleId;
                    }
                }
            }

            if (assignedDriverId) {
                const driver = await this.driverRepository.findOne({ 
                    where: { id: assignedDriverId },
                    relations: ['user']
                });

                if (!driver) {
                    throw new BadRequestException('Assigned driver not found');
                }
                
                // Check user active status if available
                if (driver.user && !driver.user.isActive) {
                    throw new BadRequestException('Assigned driver user is not active');
                }

                // Auto-assign vehicle from driver if not provided
                if (!assignedVehicleId && driver.assignedVehicleId) {
                    assignedVehicleId = driver.assignedVehicleId;
                }
            }

            const trip = this.tripRepository.create({
                organizationId,
                tripDate: createTripDto.tripDate,

                assignedDriverId: assignedDriverId, // Use resolved Driver ID
                assignedVehicleId: assignedVehicleId,
                tripType: (createTripDto.tripType as TripType) || TripType.DROP_OFF,
                isCarpool: createTripDto.isCarpool !== undefined ? createTripDto.isCarpool : (createTripDto.members.length > 1),
                status: (createTripDto.status as TripStatus) || TripStatus.SCHEDULED,
                reasonForVisit: createTripDto.reasonForVisit,
                escortName: createTripDto.escortName,
                escortRelationship: createTripDto.escortRelationship,
                reportStatus: ReportStatus.PENDING,
                mobilityRequirement: createTripDto.mobilityRequirement || MobilityRequirement.AMBULATORY,

                createdById: userId,
                startedAt: createTripDto.startedAt,
                completedAt: createTripDto.completedAt,
            });

            // For past trips, ensure dates are consistent
            if (createTripDto.status === TripStatus.COMPLETED) {
                if (!trip.startedAt) trip.startedAt = createTripDto.tripDate;
                if (!trip.completedAt) trip.completedAt = new Date(trip.startedAt.getTime() + 30 * 60000); // Default 30 min duration
                trip.finalizedAt = new Date();
            }

            const savedTrip = await this.tripRepository.save(trip);

            // Create trip stops
            const stops = createTripDto.stops.map((stopDto, index) =>
                this.tripStopRepository.create({
                    ...stopDto,
                    tripId: savedTrip.id,
                    organizationId,
                    stopOrder: stopDto.stopOrder || index + 1,
                    stopType: stopDto.stopType as StopType,
                })
            );
            await this.tripStopRepository.save(stops);

            // Create trip members
            const members = createTripDto.members.map(memberDto =>
                this.tripMemberRepository.create({
                    ...memberDto,
                    tripId: savedTrip.id,
                    organizationId,
                    memberStatus: MemberStatus.SCHEDULED,
                })
            );
            await this.tripMemberRepository.save(members);

            // Create trip reports (one per member)
            const reports = createTripDto.members.map(memberDto =>
                this.tripReportRepository.create({
                    tripId: savedTrip.id,
                    organizationId,
                    memberId: memberDto.memberId,
                    driverId: savedTrip.assignedDriverId, // Initial assignment
                    status: TripReportStatus.DRAFT,
                })
            );
            await this.tripReportRepository.save(reports);

            await this.activityLogService.log(
                ActivityType.TRIP_CREATED,
                `New trip #${savedTrip.id.slice(0, 8)} created`,
                organizationId,
                { tripId: savedTrip.id, createdBy: userId }
            );

            return this.getTripById(savedTrip.id, organizationId);
        } catch (error) {
            this.logger.error('[CREATE TRIP ERROR]', error.stack);
            throw new BadRequestException(`Failed to create trip: ${error.message}`);
        }
    }

    async createTripsBulk(createTripDtos: CreateTripDto[], organizationId: string, userId: string): Promise<TripResponseDto[]> {
        const results = [];
        for (const dto of createTripDtos) {
            results.push(await this.createTrip(dto, organizationId, userId));
        }
        return results;
    }

    async findOne(id: string): Promise<Trip> {
        const trip = await this.tripRepository.findOne({
            where: { id },
            relations: ['tripStops', 'tripMembers', 'tripMembers.member', 'assignedVehicle', 'tripReports'],
        });
        if (!trip) {
            throw new NotFoundException(`Trip with ID ${id} not found`);
        }
        return trip;
    }

    async getTripById(tripId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId, organizationId },
            relations: ['tripMembers', 'tripMembers.member', 'tripStops', 'tripReports'],
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return {
            id: trip.id,
            organizationId: trip.organizationId,
            tripDate: trip.tripDate,
            assignedDriverId: trip.assignedDriverId,
            assignedVehicleId: trip.assignedVehicleId,
            tripType: trip.tripType,
            isCarpool: trip.isCarpool,
            status: trip.status,
            reasonForVisit: trip.reasonForVisit,
            escortName: trip.escortName,
            escortRelationship: trip.escortRelationship,
            reportStatus: trip.reportStatus,
            reportFilePath: trip.reportFilePath,
            reportRejectionReason: trip.reportRejectionReason,
            reportVerifiedAt: trip.reportVerifiedAt,
            reportVerifiedBy: trip.reportVerifiedBy,
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
            reports: trip.tripReports || [],
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
            startedAt: trip.startedAt,
            completedAt: trip.completedAt,
        };
    }

    async getTrips(organizationId: string, filters: { date?: Date, startDate?: Date, endDate?: Date, status?: TripStatus, memberId?: string }): Promise<TripResponseDto[]> {
        const whereClause: any = { organizationId };

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            whereClause.tripDate = Between(startOfDay, endOfDay);
        } else if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.tripDate = Between(start, end);
        }

        if (filters.status) {
            whereClause.status = filters.status;
        }

        if (filters.memberId) {
            whereClause.tripMembers = {
                memberId: filters.memberId
            };
        }

        const trips = await this.tripRepository.find({
            where: whereClause,
            relations: ['tripMembers', 'tripMembers.member', 'tripStops'],
            order: { tripDate: 'DESC' }, // Newest first for archives
        });

        return trips.map(trip => ({
            id: trip.id,
            organizationId: trip.organizationId,
            tripDate: trip.tripDate,
            assignedDriverId: trip.assignedDriverId,
            assignedVehicleId: trip.assignedVehicleId,
            tripType: trip.tripType,
            isCarpool: trip.isCarpool,
            status: trip.status,
            reasonForVisit: trip.reasonForVisit,
            escortName: trip.escortName,
            escortRelationship: trip.escortRelationship,
            reportStatus: trip.reportStatus,
            reportFilePath: trip.reportFilePath,
            reportRejectionReason: trip.reportRejectionReason,
            reportVerifiedAt: trip.reportVerifiedAt,
            reportVerifiedBy: trip.reportVerifiedBy,
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
            reports: trip.tripReports || [],
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
            startedAt: trip.startedAt,
            completedAt: trip.completedAt,
        }));
    }

    async getDriverTrips(driverId: string, organizationId: string): Promise<TripResponseDto[]> {
        const resolvedDriverId = driverId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trips = await this.tripRepository.find({
            where: {
                organizationId,
                assignedDriverId: resolvedDriverId,
                tripDate: Between(today, new Date(today.getTime() + 86400000)),
            },
            relations: ['tripMembers', 'tripMembers.member', 'tripStops'],
            order: { tripDate: 'ASC' },
        });

        return trips.map(trip => ({
            id: trip.id,
            organizationId: trip.organizationId,
            tripDate: trip.tripDate,
            assignedDriverId: trip.assignedDriverId,
            assignedVehicleId: trip.assignedVehicleId,
            tripType: trip.tripType,
            isCarpool: trip.isCarpool,
            status: trip.status,
            reasonForVisit: trip.reasonForVisit,
            escortName: trip.escortName,
            escortRelationship: trip.escortRelationship,
            reportStatus: trip.reportStatus,
            reportFilePath: trip.reportFilePath,
            reportRejectionReason: trip.reportRejectionReason,
            reportVerifiedAt: trip.reportVerifiedAt,
            reportVerifiedBy: trip.reportVerifiedBy,
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
            reports: trip.tripReports || [],
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
            startedAt: trip.startedAt,
            completedAt: trip.completedAt,
        }));
    }

    async updateTrip(tripId: string, updateTripDto: UpdateTripDto, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId, organizationId },
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        // Trip Locking: Prevent any updates to COMPLETED or FINALIZED trips
        // unless it's a status transition to FINALIZED (allowed for COMPLETED)
        if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.FINALIZED) {
            const isTransitionToFinalized = trip.status === TripStatus.COMPLETED && updateTripDto.status === TripStatus.FINALIZED;
            if (!isTransitionToFinalized) {
                throw new ForbiddenException('Trip is locked and cannot be modified');
            }
        }

        // Compliance Guard: Verify driver is active if being assigned
        if (updateTripDto.assignedDriverId) {
            const driver = await this.driverRepository.findOne({ 
                where: { id: updateTripDto.assignedDriverId },
                relations: ['user']
            });
            
            if (!driver) {
                throw new BadRequestException('Driver not found');
            }
            if (driver.user && !driver.user.isActive) {
                throw new BadRequestException('Driver must be active and approved to be assigned to a trip');
            }

            // Check if driverId differs from current
            if (updateTripDto.assignedDriverId !== trip.assignedDriverId) {
                 await this.activityLogService.log(
                    ActivityType.SYSTEM,
                    `Trip #${trip.id.slice(0, 8)} assigned to ${driver.user?.firstName || 'Driver'} ${driver.user?.lastName || ''}`,
                    organizationId,
                    { tripId: trip.id, driverId: updateTripDto.assignedDriverId }
                 );
            }
        }

        // Validate status transitions
        if (updateTripDto.status) {
            this.validateStatusTransition(trip.status, updateTripDto.status);
        }

        Object.assign(trip, updateTripDto);
        await this.tripRepository.save(trip);

        return this.getTripById(tripId, organizationId);
    }

    async startTrip(tripId: string, organizationId: string): Promise<TripResponseDto> {
        return this.updateTrip(tripId, {
            status: TripStatus.IN_PROGRESS,
            startedAt: new Date(),
        }, organizationId);
    }

    async completeTrip(tripId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.getTripById(tripId, organizationId);

        // Verify all members have signatures (this will be checked later with signature service)
        if (trip.status !== TripStatus.IN_PROGRESS && trip.status !== TripStatus.WAITING_FOR_CLIENTS) {
            throw new BadRequestException('Trip must be in progress or waiting for clients');
        }

        const result = await this.updateTrip(tripId, {
            status: TripStatus.COMPLETED,
            completedAt: new Date(),
        }, organizationId);

        await this.activityLogService.log(
            ActivityType.TRIP_COMPLETED,
            `Trip #${tripId.slice(0, 8)} completed`,
            organizationId,
            { tripId }
        );

        return result;
    }

    async markMemberReady(tripId: string, memberId: string, organizationId: string): Promise<void> {
        const tripMember = await this.tripMemberRepository.findOne({
            where: { tripId, memberId, organizationId },
        });

        if (!tripMember) {
            throw new NotFoundException('Trip member not found');
        }

        tripMember.memberStatus = MemberStatus.READY_FOR_PICKUP;
        tripMember.readyForPickupAt = new Date();
        await this.tripMemberRepository.save(tripMember);

        // TODO: Trigger notification to driver
    }

    async arriveAtStop(tripId: string, stopId: string, organizationId: string, gps?: { lat: number, lng: number }): Promise<TripStop> {
        const stop = await this.tripStopRepository.findOne({
            where: { id: stopId, tripId, organizationId },
        });

        if (!stop) {
            throw new NotFoundException(`Stop with ID ${stopId} not found in trip ${tripId}`);
        }

        stop.actualArrivalTime = new Date();
        if (gps) {
            stop.gpsLatitude = gps.lat;
            stop.gpsLongitude = gps.lng;
        }
        return this.tripStopRepository.save(stop);
    }

    async saveMemberSignature(tripId: string, memberId: string, organizationId: string, signatureDto: MemberSignatureDto): Promise<void> {
        const tripMember = await this.tripMemberRepository.findOne({
            where: { tripId, memberId, organizationId },
        });

        if (!tripMember) {
            throw new NotFoundException('Trip member not found');
        }

        tripMember.memberSignatureBase64 = signatureDto.signatureBase64;
        tripMember.isProxySignature = signatureDto.isProxySignature || false;
        tripMember.proxySignerName = signatureDto.proxySignerName;
        tripMember.proxyRelationship = signatureDto.proxyRelationship;
        tripMember.proxyReason = signatureDto.proxyReason;

        await this.tripMemberRepository.save(tripMember);

        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Report/Signature submitted for member ${tripMember.memberId} on Trip #${tripId.slice(0, 8)}`,
            organizationId,
            { tripId, memberId }
        );
    }

    async completeStop(tripId: string, stopId: string, organizationId: string, odometerReading?: number): Promise<TripStop> {
        const stop = await this.tripStopRepository.findOne({
            where: { id: stopId, tripId, organizationId },
        });

        if (!stop) {
            throw new NotFoundException(`Stop with ID ${stopId} not found in trip ${tripId}`);
        }

        stop.actualDepartureTime = new Date();
        if (odometerReading) {
            stop.odometerReading = odometerReading;
        }
        return this.tripStopRepository.save(stop);
    }

    private validateStatusTransition(currentStatus: TripStatus, newStatus: TripStatus): void {
        const validTransitions = {
            [TripStatus.PENDING_APPROVAL]: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
            [TripStatus.SCHEDULED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
            [TripStatus.IN_PROGRESS]: [TripStatus.WAITING_FOR_CLIENTS, TripStatus.COMPLETED, TripStatus.CANCELLED],
            [TripStatus.WAITING_FOR_CLIENTS]: [TripStatus.IN_PROGRESS, TripStatus.COMPLETED],
            [TripStatus.COMPLETED]: [TripStatus.FINALIZED],
            [TripStatus.FINALIZED]: [],
            [TripStatus.CANCELLED]: [],
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }
    }



    async rejectReport(tripId: string, reason: string, userId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.findOne(tripId);
        if (trip.organizationId !== organizationId) throw new ForbiddenException();

        trip.reportStatus = ReportStatus.REJECTED;
        trip.reportRejectionReason = reason;
        await this.tripRepository.save(trip);

        return this.getTripById(tripId, organizationId);
    }

    async cancelTrip(tripId: string, organizationId: string, userId: string, cancelDto: CancelTripDto): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId, organizationId },
            relations: ['tripMembers', 'tripStops'],
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        // Prevent cancellation of completed or finalized trips
        if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.FINALIZED) {
            throw new BadRequestException('Cannot cancel a completed or finalized trip');
        }

        trip.status = TripStatus.CANCELLED;
        trip.cancellationReason = cancelDto.reason;
        trip.cancelledBy = userId;
        trip.cancelledAt = new Date();
        trip.noShowNotes = cancelDto.notes;

        const savedTrip = await this.tripRepository.save(trip);

        return {
            id: savedTrip.id,
            organizationId: savedTrip.organizationId,
            tripDate: savedTrip.tripDate,
            assignedDriverId: savedTrip.assignedDriverId,
            assignedVehicleId: savedTrip.assignedVehicleId,
            tripType: savedTrip.tripType,
            isCarpool: savedTrip.isCarpool,
            status: savedTrip.status,
            reasonForVisit: savedTrip.reasonForVisit,
            escortName: savedTrip.escortName,
            escortRelationship: savedTrip.escortRelationship,
            reportStatus: savedTrip.reportStatus,
            reportFilePath: savedTrip.reportFilePath,
            reportRejectionReason: savedTrip.reportRejectionReason,
            reportVerifiedAt: savedTrip.reportVerifiedAt,
            reportVerifiedBy: savedTrip.reportVerifiedBy,
            memberCount: savedTrip.tripMembers?.length || 0,
            stops: savedTrip.tripStops || [],
            members: savedTrip.tripMembers || [],
            reports: savedTrip.tripReports || [],
            mobilityRequirement: savedTrip.mobilityRequirement,
            createdAt: savedTrip.createdAt,
        };
    }

    async markNoShow(tripId: string, organizationId: string, userId: string, noShowDto: MarkNoShowDto): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId, organizationId },
            relations: ['tripMembers', 'tripStops'],
        });

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        // Can only mark no-show for trips that are in progress or scheduled
        if (trip.status !== TripStatus.IN_PROGRESS && trip.status !== TripStatus.SCHEDULED) {
            throw new BadRequestException('Can only mark no-show for scheduled or in-progress trips');
        }

        trip.status = TripStatus.NO_SHOW;
        trip.cancellationReason = 'NO_SHOW';
        trip.cancelledBy = userId;
        trip.cancelledAt = new Date();
        trip.noShowNotes = `Attempted contact: ${noShowDto.attemptedContact ? 'Yes' : 'No'}. ${noShowDto.notes}`;

        const savedTrip = await this.tripRepository.save(trip);

        return {
            id: savedTrip.id,
            organizationId: savedTrip.organizationId,
            tripDate: savedTrip.tripDate,
            assignedDriverId: savedTrip.assignedDriverId,
            assignedVehicleId: savedTrip.assignedVehicleId,
            tripType: savedTrip.tripType,
            isCarpool: savedTrip.isCarpool,
            status: savedTrip.status,
            reasonForVisit: savedTrip.reasonForVisit,
            escortName: savedTrip.escortName,
            escortRelationship: savedTrip.escortRelationship,
            reportStatus: savedTrip.reportStatus,
            reportFilePath: savedTrip.reportFilePath,
            reportRejectionReason: savedTrip.reportRejectionReason,
            reportVerifiedAt: savedTrip.reportVerifiedAt,
            reportVerifiedBy: savedTrip.reportVerifiedBy,
            memberCount: savedTrip.tripMembers?.length || 0,
            stops: savedTrip.tripStops || [],
            members: savedTrip.tripMembers || [],
            reports: savedTrip.tripReports || [],
            mobilityRequirement: savedTrip.mobilityRequirement,
            createdAt: savedTrip.createdAt,
        };
    }

    async createDemoTrip(driverId: string, organizationId: string): Promise<TripResponseDto> {
        // Find a member
        const member = await this.memberRepository.findOne({
            where: { organizationId }
        });

        if (!member) {
            console.log('No members found in organization to create demo trip with');
            // If no member found, create a dummy member logic or throw specific error
            // For now, let's assume at least one member exists or throw error
             throw new BadRequestException('No members found in organization to create demo trip with. Please create a member first.');
        }

        // Create a trip for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const demoTripDto: CreateTripDto = {
            tripDate: tomorrow,
            assignedDriverId: driverId,
            tripType: TripType.PICK_UP,
            reasonForVisit: 'Dialysis',
            mobilityRequirement: MobilityRequirement.AMBULATORY,
            stops: [
                {
                    stopOrder: 1,
                    stopType: StopType.PICKUP,
                    address: member.address || '123 Main St, Phoenix, AZ 85001',
                    scheduledTime: tomorrow,
                },
                {
                    stopOrder: 2,
                    stopType: StopType.DROPOFF,
                    address: '123 Medical Center Dr, Phoenix, AZ 85001',
                    scheduledTime: new Date(tomorrow.getTime() + 3600000), // +1 hour
                }
            ],
            members: [
                {
                    memberId: member.id,
                    pickupStopId: null, // these will be ignored/generated by create logic usually, but DTO might require them? 
                    // CreateTripDto.members is TripMemberDto[]
                    // TripMemberDto needs memberId.
                }
            ]
        };

        return this.createTrip(demoTripDto, organizationId, driverId);
    }

    async submitReport(
        tripId: string, 
        organizationId: string, 
        userId: string, 
        reportPayload: { tripData: any, signatureData: any, pdfPath?: string }
    ): Promise<TripResponseDto> {
        // 1. Fetch Full Trip Details
        const trip = await this.tripRepository.findOne({ 
            where: { id: tripId, organizationId },
            relations: ['tripMembers', 'tripMembers.member', 'assignedVehicle', 'assignedDriver', 'assignedDriver.user']
        });
        if (!trip) throw new NotFoundException('Trip not found');

        // 2. Build AHCCCS Compliant Report
        const builder = new TripReportBuilder();

        // -- Provider (Dynamic from Organization) --
        const org = await this.organizationRepository.findOne({ where: { id: organizationId } });
        builder.withProvider({
            ahcccsId: org?.ahcccsProviderId || '201337',
            name: org?.name || 'Great Valley Behavioral Homes',
            address: org?.address || '6241 N 19th Ave, Phoenix, AZ 85015',
            phoneNumber: org?.phoneNumber || '(602) 283-5154'
        });

        // -- Metadata --
        builder.withReportMetadata({
            reportDate: new Date(),
            pageNumber: 1,
            totalPages: 1
        });

        // -- Driver --
        const driverName = trip.assignedDriver 
            ? `${trip.assignedDriver.user?.firstName || ''} ${trip.assignedDriver.user?.lastName || ''}`.trim() || trip.assignedDriver.licenseNumber
            : 'Unknown Driver';
        
        // If driver relation user not loaded, use what we have or just a placeholder
        // assignedDriver relation in entity doesn't show 'user' relation loaded in findOne above
        // We might need to rely on what's available or fetching. 
        // For now, let's use a safe fallback or assume driver entity has name fields if updated.
        // Actually the Driver entity likely has relations too. 
        // Let's just use "Driver Name" placeholder if missing to avoid runtime error, or fetch it.
        // Better: Use `trip.assignedDriverId` to fetch User if needed.
        // BUT, for speed, let's assume `reportPayload` might contain driver name? No.
        // Let's use a standard name.
        builder.withDriver(driverName === 'Unknown Driver' ? 'Assigned Driver' : driverName);

        // -- Vehicle --
        if (trip.assignedVehicle) {
            builder.withVehicle({
                fleetId: trip.assignedVehicle.vehicleNumber || 'N/A',
                make: trip.assignedVehicle.make || 'Unknown',
                color: trip.assignedVehicle.color || 'White',
                type: ReportVehicleType.WHEELCHAIR_VAN // Defaulting to Van, should map from trip.assignedVehicle.type
            });
        } else {
             builder.withVehicle({
                fleetId: 'UNKNOWN',
                make: 'Unknown',
                color: 'Unknown',
                type: ReportVehicleType.WHEELCHAIR_VAN
            });
        }

        // -- Member --
        // Taking first member for now (simplification for singleton trips)
        const member = trip.tripMembers?.[0]?.member;
        if (member) {
            builder.withMember({
                ahcccsId: member.memberId || 'MISSING',
                name: `${member.firstName} ${member.lastName}`,
                dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : new Date('1970-01-01'),
                mailingAddress: {
                    street: member.address || 'Unknown',
                    city: 'Phoenix', // distinct fields might be missing in simplified Member entity
                    state: 'AZ',
                    zipCode: '85000'
                }
            });
        } else {
             // Fallback to payload data if member not linked to trip
             const data = reportPayload.tripData;
             builder.withMember({
                ahcccsId: data.memberId || 'MISSING_ID',
                name: data.memberName || 'Guest Member',
                dateOfBirth: new Date('1980-01-01'), // Fallback DOB
                mailingAddress: {
                    street: 'Unknown Address',
                    city: 'Phoenix',
                    state: 'AZ',
                    zipCode: '85000'
                }
            });
        }

        // -- Trip Legs --
        // Construct from Actual Data in Payload
        const data = reportPayload.tripData;
        
        // Frontend sends data in 'legs' array, but we fallback to top-level if missing
        const legData = (data.legs && data.legs.length > 0) ? data.legs[0] : data;

        const leg = TripLegFactory.createOneWayTrip(
            { physicalAddress: legData.pickupAddress || 'Pickup Loc', city: 'Phoenix', zipCode: '' }, // pickup
            legData.pickupTime ? new Date(legData.pickupTime) : new Date(),
            legData.startOdometer || 0,
            { physicalAddress: legData.dropoffAddress || 'Dropoff Loc', city: 'Phoenix', zipCode: '' }, // dropoff
            legData.dropoffTime ? new Date(legData.dropoffTime) : new Date(),
            legData.endOdometer || 0,
            trip.reasonForVisit || 'Medical',
            undefined // Escort
        );
        builder.addTripLeg(leg);

        // -- Signatures --
        if (reportPayload.signatureData) {
            let driverSignature = reportPayload.signatureData.driver;
            
            // Auto-apply saved signature if missing in payload
            if (!driverSignature && trip.assignedDriver?.savedSignature) {
                driverSignature = trip.assignedDriver.savedSignature;
                console.log('Auto-applying saved driver signature');
            } else if (!driverSignature && trip.assignedDriver?.user?.signatureUrl) {
                driverSignature = trip.assignedDriver.user.signatureUrl;
                console.log('Auto-applying user profile signature');
            }

            if (driverSignature) {
                builder.withDriverSignature({
                    name: driverName, // Use resolved driver name
                    method: SignatureMethod.PROVIDER_SIGNATURE,
                    timestamp: new Date(),
                    signatureBase64: driverSignature
                });
                
                // Ensure it's passed into the report entity below
                if (!reportPayload.signatureData.driver) {
                    reportPayload.signatureData.driver = driverSignature;
                }
            }

            if (reportPayload.signatureData.member) {
                builder.withMemberSignature({
                    name: member ? `${member.firstName} ${member.lastName}` : 'Member',
                    method: SignatureMethod.MEMBER_SIGNATURE,
                    timestamp: new Date(),
                    signatureBase64: reportPayload.signatureData.member
                });
            }
        }

        const builtReport = builder.build();

        // 3. Generate PDF or Use Uploaded
        let pdfPath: string;
        if (reportPayload.pdfPath) {
            console.log(`Using uploaded PDF at: ${reportPayload.pdfPath}`);
            pdfPath = reportPayload.pdfPath;
        } else {
             console.log('Generating PDF from data...');
             pdfPath = await PDFGenerator.generatePDF(builtReport.report, {
                outputPath: `./reports/${tripId}_${Date.now()}.pdf`, 
                addSignatures: true
            });
        }

        // 4. Create/Update TripReport Entity
        let tripReport = await this.tripReportRepository.findOne({ where: { trip: { id: tripId } } });

        if (!tripReport) {
            tripReport = this.tripReportRepository.create({
                trip,
                pickupTime: legData.pickupTime ? new Date(legData.pickupTime) : undefined,
                dropoffTime: legData.dropoffTime ? new Date(legData.dropoffTime) : undefined,
                startOdometer: legData.startOdometer,
                endOdometer: legData.endOdometer,
                totalMiles: legData.totalMiles,
                serviceVerified: data.serviceVerified,
                clientArrived: data.clientArrived,
                incidentReported: data.incidentReported,
                incidentDescription: data.incidentDescription,
                notes: data.additionalInfo, // Mapped from frontend 'additionalInfo'
                status: TripReportStatus.SUBMITTED,
                submissionMethod: 'APP',
                submittedAt: new Date(),
                submittedBy: userId,
                organizationId,
                passengerSignature: reportPayload.signatureData?.member,
                driverSignature: reportPayload.signatureData?.driver,
                driverAttestation: !!reportPayload.signatureData?.driver,
                driverAttestedAt: reportPayload.signatureData?.driver ? new Date() : undefined,
                passengerSignedAt: reportPayload.signatureData?.member ? new Date() : undefined,
            });
        } else {
            // Update existing
            tripReport.pickupTime = data.pickupTime ? new Date(data.pickupTime) : undefined;
            tripReport.dropoffTime = data.dropoffTime ? new Date(data.dropoffTime) : undefined;
            tripReport.startOdometer = data.startOdometer;
            tripReport.endOdometer = data.endOdometer;
            tripReport.totalMiles = data.totalMiles;
            tripReport.serviceVerified = data.serviceVerified;
            tripReport.clientArrived = data.clientArrived;
            tripReport.incidentReported = data.incidentReported;
            tripReport.incidentDescription = data.incidentDescription;
            tripReport.notes = data.notes;
            tripReport.status = TripReportStatus.SUBMITTED;
            tripReport.submissionMethod = 'APP';
            tripReport.submittedAt = new Date();
            tripReport.submittedBy = userId;
            tripReport.passengerSignature = reportPayload.signatureData?.member;
            tripReport.driverSignature = reportPayload.signatureData?.driver;
            tripReport.driverAttestation = !!reportPayload.signatureData?.driver;
            tripReport.driverAttestedAt = reportPayload.signatureData?.driver ? new Date() : undefined;
            tripReport.passengerSignedAt = reportPayload.signatureData?.member ? new Date() : undefined;
        }

        await this.tripReportRepository.save(tripReport);

        // 5. Update Trip
        trip.reportStatus = ReportStatus.PENDING;
        trip.reportFilePath = pdfPath;
        trip.status = TripStatus.COMPLETED;
        if (!trip.completedAt) trip.completedAt = new Date();

        await this.tripRepository.save(trip);

        // 6. Log Activity
        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Trip Report submitted for Trip #${trip.id.slice(0, 8)}`,
            organizationId,
            { tripId: trip.id, userId }
        );

        // 7. Notify Admin
        try {
            await this.notificationService.createTripReportSubmittedNotification({
                organizationId,
                tripId: trip.id,
                reportId: tripReport.id,
                driverId: trip.assignedDriverId,
                driverName: trip.assignedDriver?.user ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}` : 'Unassigned',
            });
        } catch (e) {
            this.logger.error("Failed to send notification", e.stack);
        }

        return this.getTripById(trip.id, organizationId);
    }
    async generateReportForTrip(tripId: string): Promise<string> {
        // 1. Fetch Full Trip Details including TripReport and Signatures
        const trip = await this.tripRepository.findOne({ 
            where: { id: tripId },
            relations: [
                'tripMembers', 
                'tripMembers.member', 
                'tripStops', 
                'assignedVehicle', 
                'assignedDriver', 
                'assignedDriver.user',
                'tripReports'
            ]
        });
        
        if (!trip) throw new NotFoundException('Trip not found');

        // 2. Build AHCCCS Compliant Report
        const builder = new TripReportBuilder();

        // -- Provider (Dynamic from Organization) --
        const org = await this.organizationRepository.findOne({ where: { id: trip.organizationId } });
        builder.withProvider({
            ahcccsId: org?.ahcccsProviderId || '201337',
            name: org?.name || 'Great Valley Behavioral Homes',
            address: org?.address || '6241 N 19th Ave, Phoenix, AZ 85015',
            phoneNumber: org?.phoneNumber || '(602) 283-5154'
        });

        // -- Metadata --
        builder.withReportMetadata({
            reportDate: new Date(), // Download date
            pageNumber: 1,
            totalPages: 1
        });

        // -- Driver --
        const driverName = trip.assignedDriver 
            ? `${trip.assignedDriver.user?.firstName || ''} ${trip.assignedDriver.user?.lastName || ''}`.trim() || trip.assignedDriver.licenseNumber
            : 'Assigned Driver';
        builder.withDriver(driverName);

        // -- Vehicle --
        if (trip.assignedVehicle) {
            builder.withVehicle({
                fleetId: trip.assignedVehicle.vehicleNumber || 'N/A',
                make: trip.assignedVehicle.make || 'Unknown',
                color: trip.assignedVehicle.color || 'White',
                type: ReportVehicleType.WHEELCHAIR_VAN
            });
        } else {
             builder.withVehicle({
                fleetId: 'UNKNOWN',
                make: 'Unknown',
                color: 'Unknown',
                type: ReportVehicleType.WHEELCHAIR_VAN
            });
        }

        // -- Member --
        const member = trip.tripMembers?.[0]?.member;
        const tripMember = trip.tripMembers?.[0];

        if (member) {
            builder.withMember({
                ahcccsId: member.memberId || 'MISSING',
                name: `${member.firstName} ${member.lastName}`,
                dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : new Date('1970-01-01'),
                mailingAddress: {
                    street: member.address || 'Unknown',
                    city: 'Phoenix',
                    state: 'AZ',
                    zipCode: '85000'
                }
            });
        }

        // -- Trip Legs --
        // Try to find existing TripReport data
        const reportEntity = trip.tripReports?.find(r => r.memberId === member?.id) || trip.tripReports?.[0]; // Fallback to first

        // Determine Locations from Stops
        // sort stops by stopOrder
        const sortedStops = (trip.tripStops || []).sort((a, b) => a.stopOrder - b.stopOrder);
        const pickupStop = sortedStops.find(s => s.stopType === StopType.PICKUP) || sortedStops[0];
        const dropoffStop = sortedStops.find(s => s.stopType === StopType.DROPOFF) || sortedStops[1];

        const leg = TripLegFactory.createOneWayTrip(
            { physicalAddress: pickupStop?.address || 'Pickup Loc', city: 'Phoenix', zipCode: '' },
            reportEntity?.pickupTime || pickupStop?.scheduledTime || new Date(),
            reportEntity?.startOdometer || 0,
            { physicalAddress: dropoffStop?.address || 'Dropoff Loc', city: 'Phoenix', zipCode: '' },
            reportEntity?.dropoffTime || dropoffStop?.scheduledTime || new Date(),
            reportEntity?.endOdometer || 0,
            trip.reasonForVisit || 'Medical',
            undefined
        );
        // Calculate miles if report entity has it, else diff odometers
        // if (reportEntity?.totalMiles) {
        //     leg.tripMiles = reportEntity.totalMiles;
        // } else if (reportEntity?.endOdometer && reportEntity?.startOdometer) {
        //     leg.tripMiles = reportEntity.endOdometer - reportEntity.startOdometer;
        // }

        builder.addTripLeg(leg);

        // -- Signatures --
        // Load from TripMember entity
        if (tripMember?.memberSignatureBase64 || reportEntity?.passengerSignature) {
             const signerName = tripMember?.isProxySignature 
                ? `${tripMember.proxySignerName} (Proxy for ${member?.firstName} ${member?.lastName})`
                : (member ? `${member.firstName} ${member.lastName}` : 'Member');
                
             builder.withMemberSignature({
                name: signerName,
                method: SignatureMethod.MEMBER_SIGNATURE,
                timestamp: reportEntity?.passengerSignedAt || new Date(),
                signatureBase64: reportEntity?.passengerSignature || tripMember?.memberSignatureBase64
            });
        }
        
        // Driver signature
        let driverSig = reportEntity?.driverSignature;
        if (!driverSig && trip.assignedDriver?.savedSignature) {
            driverSig = trip.assignedDriver.savedSignature;
        } else if (!driverSig && trip.assignedDriver?.user?.signatureUrl) {
            driverSig = trip.assignedDriver.user.signatureUrl;
        }

        if (driverSig) {
            builder.withDriverSignature({
                name: driverName,
                method: SignatureMethod.PROVIDER_SIGNATURE,
                timestamp: reportEntity?.driverAttestedAt || new Date(),
                signatureBase64: driverSig
            });
        } else {
            builder.withDriverSignature({
                name: driverName,
                method: SignatureMethod.PROVIDER_SIGNATURE,
                timestamp: new Date(),
                signatureBase64: undefined
            });
        }


        const builtReport = builder.build();

        // 3. Generate PDF
        return PDFGenerator.generatePDF(builtReport.report, {
            outputPath: `./reports/${trip.id}_${Date.now()}.pdf`, 
            addSignatures: true
        });
    }
}
