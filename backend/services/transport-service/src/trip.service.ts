import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripStatus, TripType, ReportStatus, MobilityRequirement } from './entities/trip.entity';
import { TripMember, MemberStatus } from './entities/trip-member.entity';
import { TripStop } from './entities/trip-stop.entity';
import { User } from './entities/user.entity';
import { CreateTripDto, UpdateTripDto, TripResponseDto, MemberSignatureDto, CancelTripDto, MarkNoShowDto } from './dto/trip.dto';

@Injectable()
export class TripService {
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        @InjectRepository(TripMember)
        private readonly tripMemberRepository: Repository<TripMember>,
        @InjectRepository(TripStop)
        private readonly tripStopRepository: Repository<TripStop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createTrip(createTripDto: CreateTripDto, organizationId: string, userId: string): Promise<TripResponseDto> {
        try {
            // Create trip
            // Auto-assign vehicle if driver is assigned but vehicle is not
            let assignedVehicleId = createTripDto.assignedVehicleId;
            if (createTripDto.assignedDriverId && !assignedVehicleId) {
                const driver = await this.userRepository.findOne({ where: { id: createTripDto.assignedDriverId } });
                if (driver) {
                    // Compliance Guard
                    if (!driver.isActive) {
                        throw new BadRequestException('Cannot assign a non-active or non-compliant driver');
                    }
                    if (driver.defaultVehicleId) {
                        assignedVehicleId = driver.defaultVehicleId;
                    }
                }
            }

            const trip = this.tripRepository.create({
                organizationId,
                tripDate: createTripDto.tripDate,
                assignedDriverId: createTripDto.assignedDriverId,
                assignedVehicleId: assignedVehicleId,
                tripType: createTripDto.tripType || TripType.DROP_OFF,
                isCarpool: createTripDto.isCarpool !== undefined ? createTripDto.isCarpool : (createTripDto.members.length > 1),
                status: TripStatus.PENDING_APPROVAL,
                reasonForVisit: createTripDto.reasonForVisit,
                escortName: createTripDto.escortName,
                escortRelationship: createTripDto.escortRelationship,
                reportStatus: ReportStatus.PENDING,
                mobilityRequirement: createTripDto.mobilityRequirement || MobilityRequirement.AMBULATORY,
                createdById: userId,
            });

            const savedTrip = await this.tripRepository.save(trip);

            // Create trip stops
            const stops = createTripDto.stops.map((stopDto, index) =>
                this.tripStopRepository.create({
                    ...stopDto,
                    tripId: savedTrip.id,
                    organizationId,
                    stopOrder: stopDto.stopOrder || index + 1,
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

            return this.getTripById(savedTrip.id, organizationId);
        } catch (error) {
            console.error('[CREATE TRIP ERROR]', error);
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
            relations: ['tripStops', 'tripMembers', 'tripMembers.member', 'assignedVehicle'],
        });
        if (!trip) {
            throw new NotFoundException(`Trip with ID ${id} not found`);
        }
        return trip;
    }

    async getTripById(tripId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({
            where: { id: tripId, organizationId },
            relations: ['tripMembers', 'tripStops'],
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
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
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
            relations: ['tripMembers', 'tripStops'],
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
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
        }));
    }

    async getDriverTrips(driverId: string, organizationId: string): Promise<TripResponseDto[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trips = await this.tripRepository.find({
            where: {
                organizationId,
                assignedDriverId: driverId,
                tripDate: Between(today, new Date(today.getTime() + 86400000)),
            },
            relations: ['tripMembers', 'tripStops'],
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
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
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
            const driver = await this.userRepository.findOne({ where: { id: updateTripDto.assignedDriverId } });
            if (!driver || !driver.isActive) {
                throw new BadRequestException('Driver must be active and approved to be assigned to a trip');
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

        return this.updateTrip(tripId, {
            status: TripStatus.COMPLETED,
            completedAt: new Date(),
        }, organizationId);
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
            [TripStatus.PENDING_APPROVAL]: [TripStatus.SCHEDULED, TripStatus.CANCELLED],
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

    async verifyReport(tripId: string, userId: string, organizationId: string): Promise<TripResponseDto> {
        const trip = await this.findOne(tripId);
        if (trip.organizationId !== organizationId) throw new ForbiddenException();

        trip.reportStatus = ReportStatus.VERIFIED;
        trip.reportVerifiedAt = new Date();
        trip.reportVerifiedBy = userId;
        await this.tripRepository.save(trip);

        return this.getTripById(tripId, organizationId);
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
            mobilityRequirement: savedTrip.mobilityRequirement,
            createdAt: savedTrip.createdAt,
        };
    }
}
