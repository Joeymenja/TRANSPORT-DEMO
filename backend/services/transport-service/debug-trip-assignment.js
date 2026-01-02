const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function debugAssignment() {
    try {
        await client.connect();

        console.log('--- DEBUGGING DRIVER CONSOLE DATA ---');

        // 1. Get Driver User
        const driverRes = await client.query("SELECT id, email, first_name FROM users WHERE email = 'driver@gvt.com'");
        if (driverRes.rows.length === 0) {
            console.error('ERROR: Driver user "driver@gvt.com" NOT FOUND in users table.');
        } else {
            const driver = driverRes.rows[0];
            console.log(`Driver User: ${driver.email} | ID: ${driver.id}`);

            // 2. Check Trips assigned to this driver
            const tripsRes = await client.query("SELECT id, status, assigned_driver_id FROM trips WHERE assigned_driver_id = $1", [driver.id]);
            console.log(`Trips assigned to this driver ID: ${tripsRes.rows.length}`);
            tripsRes.rows.forEach(t => {
                console.log(` - Trip ${t.id} [${t.status}]`);
            });

            // 3. Check ALL active trips to see who they are assigned to
            const allTripsRes = await client.query("SELECT id, status, assigned_driver_id FROM trips WHERE status IN ('SCHEDULED', 'IN_PROGRESS')");
            console.log(`Total Active Trips in DB: ${allTripsRes.rows.length}`);
            allTripsRes.rows.forEach(t => {
                console.log(` - Trip ${t.id} [${t.status}] | AssignedTo: ${t.assigned_driver_id}`);
                if (t.assigned_driver_id !== driver.id) {
                    console.log('   -> MISMATCH: This trip is not assigned to the driver user.');
                }
            });

            // 4. FIX: If active trip exists but not assigned to driver, assign it.
            if (allTripsRes.rows.length > 0 && tripsRes.rows.length === 0) {
                console.log('--- ATTEMPTING FIX ---');
                const targetTrip = allTripsRes.rows[0];
                await client.query("UPDATE trips SET assigned_driver_id = $1 WHERE id = $2", [driver.id, targetTrip.id]);
                console.log(`Updated Trip ${targetTrip.id} to be assigned to Driver ${driver.id}`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

debugAssignment();
