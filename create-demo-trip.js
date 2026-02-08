const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function run() {
    await client.connect();

    const driverId = 'ce28d5a1-a60a-4309-994e-9e228c73bc60'; // new.driver
    const memberId = '2e087456-7b4d-495e-987e-b47104e52bb9';
    const tripId = crypto.randomUUID();
    const pickupId = crypto.randomUUID();
    const dropoffId = crypto.randomUUID();

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const driverEntityId = 'f51cf355-f20b-44f6-8d52-e23a6cfb811e';

    try {
        await client.query('BEGIN');

        // Create Trip
        const insertTrip = `
            INSERT INTO trips (
                id, trip_date, status, mobility_requirement, 
                assigned_driver_id, organization_id, created_by_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00', 'ce28d5a1-a60a-4309-994e-9e228c73bc60', NOW(), NOW())
        `;
        await client.query(insertTrip, [tripId, now, 'SCHEDULED', 'AMBULATORY', driverEntityId]);

        // Link Member
        await client.query(
            "INSERT INTO trip_members (trip_id, member_id, organization_id, created_at) VALUES ($1, $2, 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00', NOW())",
            [tripId, memberId]
        );

        // Stops
        // Pickup
        await client.query(`
            INSERT INTO trip_stops (
                id, trip_id, stop_type, stop_order, 
                address, scheduled_time, organization_id, created_at
            ) VALUES ($1, $2, 'PICKUP', 1, '1235 E Washington St, Phoenix, AZ', $3, 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00', NOW())
        `, [pickupId, tripId, now]);

        // Dropoff
        await client.query(`
            INSERT INTO trip_stops (
                id, trip_id, stop_type, stop_order, 
                address, scheduled_time, organization_id, created_at
            ) VALUES ($1, $2, 'DROPOFF', 2, '550 W Thomas Rd, Phoenix, AZ (St Joseph Hospital)', $3, 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00', NOW())
        `, [dropoffId, tripId, oneHourLater]);

        await client.query('COMMIT');
        console.log('Trip Created:', tripId);

    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
    } finally {
        await client.end();
    }
}

run();
