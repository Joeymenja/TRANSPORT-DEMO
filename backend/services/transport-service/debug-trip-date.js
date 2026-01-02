const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function debugTripDate() {
    try {
        await client.connect();
        console.log('--- DEBUGGING TRIP DATES ---');

        // 1. Get Driver
        const driverRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvt.com'");
        const driverId = driverRes.rows[0].id; // assume exists

        // 2. Get Trips for Driver
        const res = await client.query("SELECT id, trip_date, status, assigned_driver_id FROM trips WHERE assigned_driver_id = $1", [driverId]);

        console.log(`Trips for driver ${driverId}:`);
        res.rows.forEach(t => {
            console.log(` - ID: ${t.id}`);
            console.log(`   Status: ${t.status}`);
            console.log(`   Date (DB): ${t.trip_date}`);
            console.log(`   JS Date: ${new Date(t.trip_date).toISOString()}`);
        });

        // 3. Fix Date to Today if needed
        if (res.rows.length > 0) {
            const trip = res.rows.find(t => t.status === 'SCHEDULED' || t.status === 'IN_PROGRESS') || res.rows[0];
            const today = new Date();
            // Format as YYYY-MM-DD for SQL (roughly) or just pass Date object

            console.log(`Updating Trip ${trip.id} date to TODAY (${today.toISOString()})`);
            await client.query("UPDATE trips SET trip_date = $1 WHERE id = $2", [today, trip.id]);
            console.log('Update complete.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

debugTripDate();
