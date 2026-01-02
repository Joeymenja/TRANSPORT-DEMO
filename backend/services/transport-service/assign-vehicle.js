const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function assignVehicle() {
    try {
        await client.connect();

        // Find the seeded driver
        const driverRes = await client.query(`SELECT id, email FROM users WHERE role = 'DRIVER' LIMIT 1`);
        if (driverRes.rows.length === 0) {
            console.log('No driver found.');
            return;
        }
        const driver = driverRes.rows[0];
        console.log(`Found driver: ${driver.email} (${driver.id})`);

        // Find a vehicle
        const vehicleRes = await client.query(`SELECT id, vehicle_number FROM vehicles LIMIT 1`);
        if (vehicleRes.rows.length === 0) {
            console.log('No vehicle found.');
            return;
        }
        const vehicle = vehicleRes.rows[0];
        console.log(`Found vehicle: ${vehicle.vehicle_number} (${vehicle.id})`);

        // Update user
        await client.query(`UPDATE users SET default_vehicle_id = $1 WHERE id = $2`, [vehicle.id, driver.id]);
        console.log(`Assigned vehicle ${vehicle.id} to driver ${driver.id}`);

        // Update the seeded trip to have this driver and vehicle if not already
        // Wait, the trip logic uses 'assigned_vehicle_id' on the trip table. 
        // The requirement "Auto-assign default vehicle on trip creation" means when I create a trip, it should pull from user.
        // For the existing seeded trip, let's just make sure it has the vehicle so the UI shows it.
        // The seeded trip already has a vehicle assigned in seed-demo.js.

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

assignVehicle();
