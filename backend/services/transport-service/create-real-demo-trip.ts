
import { DataSource } from 'typeorm';
import { Trip, TripType, TripStatus, MobilityRequirement } from './src/entities/trip.entity';
import { TripStop, StopType } from './src/entities/trip-stop.entity';
import { User } from './src/entities/user.entity';
import { Member } from './src/entities/member.entity';
import { TripMember, MemberStatus } from './src/entities/trip-member.entity';
import { Driver } from './src/entities/driver.entity';
import { Vehicle } from './src/entities/vehicle.entity';
import { VehicleDocument } from './src/entities/vehicle-document.entity'; // Added
import { TripReport } from './src/entities/trip-report.entity';
import { Signature } from './src/entities/signature.entity'; // Corrected
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gvbh_transport',
    entities: [Trip, TripStop, User, Member, TripMember, Driver, Vehicle, VehicleDocument, TripReport, Signature], // Corrected
    synchronize: false, // Don't sync, just use existing
});

async function createRealDemoTrip() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const userRepository = AppDataSource.getRepository(User);
        const driverRepository = AppDataSource.getRepository(Driver);
        const memberRepository = AppDataSource.getRepository(Member);
        const tripRepository = AppDataSource.getRepository(Trip);
        const tripStopRepository = AppDataSource.getRepository(TripStop);
        const tripMemberRepository = AppDataSource.getRepository(TripMember);

        // 1. Find a Driver (User)
        // Check for 'driver@example.com' or any active driver
        const driverUser = await userRepository.findOne({ where: { email: 'driver@example.com' } }); // Default demo driver
        
        let driverId = null;
        if (driverUser) {
             const driver = await driverRepository.findOne({ where: { userId: driverUser.id }});
             driverId = driver ? driver.id : null;
        }
        
        if (!driverId) {
             console.log("No specific demo driver found, picking first available driver...");
             const drivers = await driverRepository.find({ relations: ['user'], take: 1 });
             if (drivers.length > 0) driverId = drivers[0].id;
             else {
                 console.error("No drivers found in system.");
                 process.exit(1);
             }
        }

        // 2. Find a Member
        const members = await memberRepository.find({ take: 1 });
        if (members.length === 0) {
            console.error("No members found");
            process.exit(1);
        }
        const member = members[0];

        const now = new Date();
        const pickupTime = new Date(now.getTime() + 1000 * 60 * 30); // 30 mins from now

        // 3. Create Trip
        const trip = tripRepository.create({
            organizationId: 'org-1',
            tripDate: now,
            assignedDriverId: driverId!,
            tripType: TripType.PICK_UP,
            status: TripStatus.IN_PROGRESS, // Set to IN_PROGRESS so it shows up immediately on map
            createdById: driverUser?.id || 'system',
            mobilityRequirement: MobilityRequirement.AMBULATORY
        });

        const savedTrip = await tripRepository.save(trip);

        // 4. Create Stops with Coordinates
        const stops = [
            tripStopRepository.create({
                tripId: savedTrip.id,
                organizationId: 'org-1',
                stopOrder: 1,
                stopType: StopType.PICKUP,
                address: '1 Main St, Mesa, AZ 85201',
                gpsLatitude: 33.41518,
                gpsLongitude: -111.83147,
                scheduledTime: pickupTime
            }),
            tripStopRepository.create({
                tripId: savedTrip.id,
                organizationId: 'org-1',
                stopOrder: 2,
                stopType: StopType.DROPOFF,
                address: 'Phoenix Sky Harbor, Phoenix, AZ 85034',
                gpsLatitude: 33.4352,
                gpsLongitude: -112.0101,
                scheduledTime: new Date(pickupTime.getTime() + 3600000)
            })
        ];
        
        await tripStopRepository.save(stops);

        // 5. Create Trip Member
        const tripMember = tripMemberRepository.create({
            tripId: savedTrip.id,
            memberId: member.id,
            organizationId: 'org-1',
            memberStatus: MemberStatus.SCHEDULED
        });
        await tripMemberRepository.save(tripMember);

        console.log(`Successfully created Real Demo Trip #${savedTrip.id} for Driver ${driverId}`);
        console.log(`\nCoordinates:\nStart: [33.41518, -111.83147]\nEnd: [33.4352, -112.0101]`);

    } catch (err) {
        console.error("Error creating trip:", err);
    } finally {
        await AppDataSource.destroy();
    }
}

createRealDemoTrip();
