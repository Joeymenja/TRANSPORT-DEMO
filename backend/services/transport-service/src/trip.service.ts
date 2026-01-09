import { BillingService } from './billing.service';

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

    async createTrip(createTripDto: CreateTripDto, organizationId: string, userId: string): Promise<TripResponseDto> {
        try {
            // Create trip
            // Auto-assign vehicle if driver is assigned but vehicle is not
            // Auto-assign vehicle if driver is assigned but vehicle is not
            let assignedVehicleId = createTripDto.assignedVehicleId;
            let assignedDriverId = createTripDto.assignedDriverId;

            if (assignedDriverId) {
                // Resolve User ID to Driver ID if necessary
                const driverRows = await this.userRepository.query('SELECT id FROM drivers WHERE user_id = $1', [assignedDriverId]);
                const driver = driverRows.length > 0 ? { id: driverRows[0].id } : null;
                if (driver) {
                     assignedDriverId = driver.id; // It was a User ID
                } else {
                     // Maybe it is already a driver ID?
                     const driverById = await this.userRepository.manager.findOne(Driver, { where: { id: assignedDriverId } });
                     if (!driverById) {
                         // Fallback check
                         const user = await this.userRepository.findOne({ where: { id: createTripDto.assignedDriverId } });
                         if (!user) throw new BadRequestException('Assigned driver user not found');
                         if (!user.isActive) throw new BadRequestException('Driver user is not active');
                         
                         // If user exists but no driver profile, we can't assign to trip if FK expects driver_id.
                         // But if we return user.id (which assumes NO FK enforcement or User ID matches), we fail.
                         // Let's create a driver profile relative to user? No.
                         throw new BadRequestException('User exists but has no Driver profile');
                     }
                     // It is a driver ID
                }
            }
            
            if (createTripDto.assignedDriverId && !assignedVehicleId) {
                // Note: We used createTripDto.assignedDriverId (User ID) to check User for vehicle.
                // But User.defaultVehicleId is what we want.
                // The original code did:
                const user = await this.userRepository.findOne({ where: { id: createTripDto.assignedDriverId } });
                if (user) {
                    if (!user.isActive) {
                         throw new BadRequestException('Cannot assign a non-active or non-compliant driver');
                    }
                    if (user.defaultVehicleId) {
                        assignedVehicleId = user.defaultVehicleId;
                    }
                }
            }

            const trip = this.tripRepository.create({
                organizationId,
                tripDate: createTripDto.tripDate,

                assignedDriverId: assignedDriverId, // Use resolved Driver ID
                assignedVehicleId: assignedVehicleId,
                tripType: (createTripDto.tripType as TripType) || TripType.DROP_OFF,
                isCarpool: createTripDto.isCarpool !== undefined ? createTripDto.isCarpool : (createTripDto.members.length > 1),
                status: (createTripDto.status as TripStatus) || TripStatus.PENDING_APPROVAL,
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
            reports: trip.tripReports || [],
            mobilityRequirement: trip.mobilityRequirement,
            createdAt: trip.createdAt,
        }));
    }

    async getDriverTrips(driverId: string, organizationId: string): Promise<TripResponseDto[]> {
        // Resolve User ID to Driver ID if necessary
        let resolvedDriverId = driverId;
        const driver = await this.userRepository.manager.findOne(Driver, { where: { userId: driverId } });
        if (driver) {
            resolvedDriverId = driver.id;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const trips = await this.tripRepository.find({
            where: {
                organizationId,
                assignedDriverId: resolvedDriverId,
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
            reports: trip.tripReports || [],
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

        if (updateTripDto.assignedDriverId) {
            let driverId = updateTripDto.assignedDriverId;
            const driverByUserId = await this.userRepository.manager.findOne(Driver, { where: { userId: driverId } });
            if (driverByUserId) {
                driverId = driverByUserId.id;
            }

            // Check if driverId differs from current
            if (driverId !== trip.assignedDriverId) {
                 const driver = await this.userRepository.findOne({ where: { id: updateTripDto.assignedDriverId } }); // Log uses User details
                 await this.activityLogService.log(
                    ActivityType.SYSTEM,
                    `Trip #${trip.id.slice(0, 8)} assigned to ${driver?.firstName} ${driver?.lastName}`,
                    organizationId,
                    { tripId: trip.id, driverId: updateTripDto.assignedDriverId }
                 );
            }
            // Update the ID to the real Driver ID
            updateTripDto.assignedDriverId = driverId;
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
        reportPayload: { tripData: any, signatureData: any }
    ): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findOne({ where: { id: tripId, organizationId } });
        if (!trip) throw new NotFoundException('Trip not found');

        // 1. Generate PDF
        const pdfPath = await this.pdfService.generateOfficialReport(reportPayload.tripData, reportPayload.signatureData);

        // 2. Create/Update TripReport Entity
        let report = await this.tripReportRepository.findOne({ where: { trip: { id: tripId } } });
        const data = reportPayload.tripData;

        if (!report) {
            report = this.tripReportRepository.create({
                trip,
                pickupTime: data.pickupTime ? new Date(data.pickupTime) : undefined,
                dropoffTime: data.dropoffTime ? new Date(data.dropoffTime) : undefined,
                startOdometer: data.startOdometer,
                endOdometer: data.endOdometer,
                totalMiles: data.totalMiles,
                serviceVerified: data.serviceVerified,
                clientArrived: data.clientArrived,
                incidentReported: data.incidentReported,
                incidentDescription: data.incidentDescription,
                notes: data.notes,
                status: TripReportStatus.SUBMITTED,
                submissionMethod: 'APP',
                submittedAt: new Date(),
                submittedBy: userId
            });
        } else {
            // Update existing
            report.pickupTime = data.pickupTime ? new Date(data.pickupTime) : undefined;
            report.dropoffTime = data.dropoffTime ? new Date(data.dropoffTime) : undefined;
            report.startOdometer = data.startOdometer;
            report.endOdometer = data.endOdometer;
            report.totalMiles = data.totalMiles;
            report.serviceVerified = data.serviceVerified;
            report.clientArrived = data.clientArrived;
            report.incidentReported = data.incidentReported;
            report.incidentDescription = data.incidentDescription;
            report.notes = data.notes;
            report.status = TripReportStatus.SUBMITTED;
            report.submissionMethod = 'APP';
            report.submittedAt = new Date();
            report.submittedBy = userId;
        }

        await this.tripReportRepository.save(report);

        // 3. Update Trip
        trip.reportStatus = ReportStatus.PENDING;
        trip.reportFilePath = pdfPath;
        trip.status = TripStatus.COMPLETED;
        if (!trip.completedAt) trip.completedAt = new Date();

        await this.tripRepository.save(trip);

        // 4. Log Activity
        await this.activityLogService.log(
            ActivityType.REPORT_SUBMITTED,
            `Trip Report submitted for Trip #${trip.id.slice(0, 8)}`,
            organizationId,
            { tripId: trip.id, userId }
        );

        // 5. Notify Admin
        try {
            await this.notificationService.createTripReportSubmittedNotification({
                organizationId,
                tripId: trip.id,
                reportId: report.id,
                driverId: trip.assignedDriverId,
                driverName: trip.assignedDriver?.user ? `${trip.assignedDriver.user.firstName} ${trip.assignedDriver.user.lastName}` : 'Unassigned',
            });
        } catch (e) {
            console.error("Failed to send notification", e);
        }

        return this.getTripById(trip.id, organizationId);
    }
}
