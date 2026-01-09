const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function seedScheduledTrip() {
    console.log('--- CREATING SCHEDULED TRIP FOR DRIVER FLOW ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get IDs
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        const orgId = orgRes.rows[0].id;

        const driverUserRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvbh-demo.com'");
        if (driverUserRes.rows.length === 0) throw new Error('Driver user not found');
        const driverUserId = driverUserRes.rows[0].id;
        
        const driverRes = await client.query("SELECT id FROM drivers WHERE user_id = $1", [driverUserId]);
        const driverId = driverRes.rows[0].id;

        const vehicleRes = await client.query("SELECT id FROM vehicles LIMIT 1");
        const vehicleId = vehicleRes.rows[0].id;
        
        const memberRes = await client.query("SELECT id FROM members LIMIT 1");
        const memberId = memberRes.rows[0].id;

        // 2. Create Trip
        const tripId = uuidv4(); // '60b0e02f-08b6-4e65-b501-0e3a93bcc661'; // Random or fixed? Let's use random to avoid conflicts, or log it.
        const todayDate = new Date().toISOString().split('T')[0];

        console.log(`Creating Scheduled Trip: ${tripId} for Driver: ${driverId}`);

        await client.query(
            `INSERT INTO trips (id, organization_id, trip_date, assigned_driver_id, assigned_vehicle_id, trip_type, status, mobility_requirement, created_at, updated_at, created_by_id) 
             VALUES ($1, $2, $3, $4, $5, 'PICK_UP', 'SCHEDULED', 'AMBULATORY', NOW(), NOW(), $6)`,
            [tripId, orgId, todayDate, driverId, vehicleId, driverUserId] // Created by driver? usually admin/dispatcher, but fine for test.
        );

        // 3. Create Stops (Pickup and Dropoff)
        const stop1Id = uuidv4();
        const stop2Id = uuidv4();

        await client.query(
            `INSERT INTO trip_stops (id, trip_id, stop_type, stop_order, address, scheduled_time, status)
             VALUES 
             ($1, $3, 'PICKUP', 1, '123 Test St, Phoenix, AZ', NOW() + INTERVAL '1 hour', 'PENDING'),
             ($2, $3, 'DROPOFF', 2, '456 Hospital Rd, Phoenix, AZ', NOW() + INTERVAL '2 hours', 'PENDING')`,
            [stop1Id, stop2Id, tripId]
        );

        // 4. Create Trip Member
        await client.query(
            `INSERT INTO trip_members (id, trip_id, member_id, pickup_stop_id, dropoff_stop_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), tripId, memberId, stop1Id, stop2Id]
        );

        console.log('--- SCHEDULED TRIP CREATED SUCCESSFULLY ---');

    } catch (err) {
        console.error('Error creating scheduled trip:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedScheduledTrip();
