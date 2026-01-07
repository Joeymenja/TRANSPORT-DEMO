const { Client } = require('pg');
require('dotenv').config();

async function assignTripsToDriver() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        await client.connect();
        console.log('Connected to database\n');

        // Get the active driver
        const driverResult = await client.query(`
            SELECT d.id as driver_id, u.email, u.first_name, u.last_name, d.organization_id
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE u.email = 'new.driver@gvbh.com'
            LIMIT 1
        `);

        if (driverResult.rows.length === 0) {
            console.log('Driver not found');
            return;
        }

        const driver = driverResult.rows[0];
        console.log(`Found driver: ${driver.first_name} ${driver.last_name} (${driver.email})`);
        console.log(`Driver ID: ${driver.driver_id}`);
        console.log(`Organization ID: ${driver.organization_id}\n`);

        // Check for existing trips
        const tripsResult = await client.query(`
            SELECT id, trip_date, trip_type, status, assigned_driver_id
            FROM trips
            WHERE organization_id = $1
            AND trip_date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY trip_date DESC
            LIMIT 10
        `, [driver.organization_id]);

        console.log(`Found ${tripsResult.rows.length} trip(s) in the last 7 days\n`);

        if (tripsResult.rows.length === 0) {
            console.log('No trips found. Creating demo trips...\n');

            // Create demo trips
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get a vehicle
            const vehicleResult = await client.query(`
                SELECT id FROM vehicles
                WHERE organization_id = $1 AND is_active = true
                LIMIT 1
            `, [driver.organization_id]);

            const vehicleId = vehicleResult.rows[0]?.id;

            if (!vehicleId) {
                console.log('No active vehicles found');
                return;
            }

            // Create 2 demo trips for today
            for (let i = 0; i < 2; i++) {
                const tripResult = await client.query(`
                    INSERT INTO trips (
                        id, organization_id, trip_date, assigned_driver_id,
                        assigned_vehicle_id, trip_type, status, route_optimized
                    )
                    VALUES (
                        gen_random_uuid(), $1, $2, $3, $4, 'OUTBOUND', 'SCHEDULED', false
                    )
                    RETURNING id
                `, [driver.organization_id, today, driver.driver_id, vehicleId]);

                console.log(`Created trip ${i + 1}: ${tripResult.rows[0].id}`);
            }

            console.log('\nDemo trips created successfully!');
        } else {
            // Assign existing unassigned trips to the driver
            const unassignedTrips = tripsResult.rows.filter(t => !t.assigned_driver_id);

            if (unassignedTrips.length > 0) {
                console.log(`Assigning ${unassignedTrips.length} unassigned trip(s) to driver...\n`);

                for (const trip of unassignedTrips) {
                    await client.query(`
                        UPDATE trips
                        SET assigned_driver_id = $1
                        WHERE id = $2
                    `, [driver.driver_id, trip.id]);

                    console.log(`✓ Assigned trip ${trip.id} to driver`);
                }
            } else {
                console.log('All trips are already assigned');
            }

            // Show trip summary
            console.log('\nTrip summary:');
            tripsResult.rows.forEach((trip, index) => {
                console.log(`${index + 1}. Trip ${trip.id.substring(0, 8)}...`);
                console.log(`   Date: ${trip.trip_date}`);
                console.log(`   Type: ${trip.trip_type}`);
                console.log(`   Status: ${trip.status}`);
                console.log(`   Assigned: ${trip.assigned_driver_id ? 'Yes' : 'No'}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

assignTripsToDriver();
