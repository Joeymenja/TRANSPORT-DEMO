const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function seedTrips() {
    console.log('--- STARTING PHASE 2: TRIPS SEEDING (Full Restore Trip 1) ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Fetch dependencies
        // Org
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        if (orgRes.rows.length === 0) throw new Error('Org not found! Run Phase 1.');
        const orgId = orgRes.rows[0].id;

        // Users
        const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@gvbh-demo.com'");
        const adminId = adminRes.rows[0].id;

        const driverRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvbh-demo.com'");
        const driverId = driverRes.rows[0].id;

        // Vehicle (V-001)
        const vehicleRes = await client.query("SELECT id FROM vehicles WHERE vehicle_number = 'V-001'");
        const vehicleId = vehicleRes.rows[0].id;

        // Member A (DEMO-A) - partial match or exact?
        // seed-01 created 'DEMO-A-...' 
        const memberARes = await client.query("SELECT id FROM members WHERE member_id LIKE 'DEMO-A-%' LIMIT 1");
        const memberAId = memberARes.rows[0].id;

        console.log('Dependencies:', { orgId, adminId, driverId, vehicleId, memberAId });

        // 2. Create Trip 1 (Completed)
        const todayDate = new Date().toISOString().split('T')[0];
        const trip1Id = uuidv4();

        console.log('Inserting Trip 1...');
        await client.query(
            `INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'PICK_UP', 'COMPLETED')`,
            [trip1Id, orgId, todayDate, adminId, driverId, vehicleId]
        );

        // Stops
        // Use exact confirmed query structure from test
        const stop1Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (
              id, organization_id, trip_id, stop_type, stop_order, address, 
              scheduled_time, actual_arrival_time, actual_departure_time, 
              gps_latitude, gps_longitude, odometer_reading, 
              created_at, updated_at
           ) 
           VALUES (
              $1::uuid, $2, $3, 'PICKUP', 1, '123 Demo St, Phoenix, AZ',
              $4, $5, $6, 
              33.4484, -112.0740, 10500, 
              NOW(), NOW()
           )`,
            [
                stop1Id, orgId, trip1Id,
                new Date(todayDate + 'T08:00:00'),
                new Date(todayDate + 'T08:05:00'),
                new Date(todayDate + 'T08:10:00')
            ]
        );

        const stop2Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (
              id, organization_id, trip_id, stop_type, stop_order, address, 
              scheduled_time, actual_arrival_time, actual_departure_time, 
              gps_latitude, gps_longitude, odometer_reading, 
              created_at, updated_at
           ) 
           VALUES (
              $1::uuid, $2, $3, 'DROPOFF', 2, '456 Demo Clinic, Phoenix, AZ',
              $4, $5, $6, 
              33.4510, -112.0670, 10505, 
              NOW(), NOW()
           )`,
            [
                stop2Id, orgId, trip1Id,
                new Date(todayDate + 'T08:30:00'),
                new Date(todayDate + 'T08:35:00'),
                new Date(todayDate + 'T08:40:00')
            ]
        );
        console.log('Trip 1 Stops created');

        // Trip Member
        await client.query(
            `INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_signature_base64, member_status, created_at) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'COMPLETED', NOW())`,
            [orgId, trip1Id, memberAId, stop1Id, stop2Id, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==']
        );
        console.log('Trip 1 Members created');

        console.log('--- PHASE 2 COMPLETE ---');

    } catch (err) {
        console.error('Phase 2 Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedTrips();
