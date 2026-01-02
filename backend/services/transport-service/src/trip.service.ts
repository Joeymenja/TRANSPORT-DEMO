import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripStatus, TripType } from './entities/trip.entity';
import { TripMember, MemberStatus } from './entities/trip-member.entity';
import { TripStop } from './entities/trip-stop.entity';
import { User } from './entities/user.entity';
import { CreateTripDto, UpdateTripDto, TripResponseDto } from './dto/trip.dto';

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
        // Create trip
        // Auto-assign vehicle if driver is assigned but vehicle is not
        let assignedVehicleId = createTripDto.assignedVehicleId;
        if (createTripDto.assignedDriverId && !assignedVehicleId) {
            const driver = await this.userRepository.findOne({ where: { id: createTripDto.assignedDriverId } });
            if (driver && driver.defaultVehicleId) {
                assignedVehicleId = driver.defaultVehicleId;
            }
        }

        const trip = this.tripRepository.create({
            organizationId,
            tripDate: createTripDto.tripDate,
            assignedDriverId: createTripDto.assignedDriverId,
            assignedVehicleId: assignedVehicleId,
            tripType: createTripDto.tripType || TripType.DROP_OFF,
            isCarpool: createTripDto.members.length > 1,
            status: TripStatus.SCHEDULED,
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
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
            createdAt: trip.createdAt,
        };
    }

    async getTrips(organizationId: string, filters: { date?: Date, startDate?: Date, endDate?: Date, status?: TripStatus }): Promise<TripResponseDto[]> {
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
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
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
            memberCount: trip.tripMembers?.length || 0,
            stops: trip.tripStops || [],
            members: trip.tripMembers || [],
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

    async saveMemberSignature(tripId: string, memberId: string, organizationId: string, signatureBase64: string): Promise<void> {
        const tripMember = await this.tripMemberRepository.findOne({
            where: { tripId, memberId, organizationId },
        });

        if (!tripMember) {
            throw new NotFoundException('Trip member not found');
        }

        tripMember.memberSignatureBase64 = signatureBase64;
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
}
