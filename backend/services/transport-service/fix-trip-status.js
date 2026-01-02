const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function fixTripStatus() {
    try {
        await client.connect();

        console.log('--- FIXING TRIP STATUS ---');

        // 1. Get Driver
        const driverRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvt.com'");
        if (driverRes.rows.length === 0) {
            console.log('Driver not found');
            return;
        }
        const driverId = driverRes.rows[0].id;

        // 2. Find the trip assigned to this driver (we know one exists from previous steps)
        const res = await client.query("SELECT id, status, trip_date FROM trips WHERE assigned_driver_id = $1", [driverId]);

        if (res.rows.length > 0) {
            const trip = res.rows[0];
            console.log(`Found Trip ${trip.id} with status: ${trip.status}`);

            if (trip.status !== 'SCHEDULED' && trip.status !== 'IN_PROGRESS') {
                console.log(`Updating status to SCHEDULED...`);
                await client.query("UPDATE trips SET status = 'SCHEDULED' WHERE id = $1", [trip.id]);
                console.log('Update complete.');
            } else {
                console.log('Trip is already Active (SCHEDULED or IN_PROGRESS).');
            }
        } else {
            console.log('No trips found for this driver.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixTripStatus();
