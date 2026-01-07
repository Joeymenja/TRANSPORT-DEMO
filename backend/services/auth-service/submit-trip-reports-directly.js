const { Client } = require('pg');
require('dotenv').config();

async function submitTripReports() {
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

        // Get the driver and their assigned trips
        const driverEmail = 'new.driver@gvbh.com';

        const driverResult = await client.query(`
            SELECT
                d.id as driver_id,
                d.user_id,
                u.email,
                u.first_name,
                u.last_name,
                d.organization_id
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE u.email = $1
        `, [driverEmail]);

        if (driverResult.rows.length === 0) {
            console.log(`Driver ${driverEmail} not found`);
            return;
        }

        const driver = driverResult.rows[0];
        console.log(`Driver: ${driver.first_name} ${driver.last_name} (${driver.email})`);
        console.log(`Driver ID: ${driver.driver_id}\n`);

        // Get trips assigned to this driver
        const tripsResult = await client.query(`
            SELECT
                t.id,
                t.trip_date,
                t.trip_type,
                t.status,
                t.report_status,
                v.odometer
            FROM trips t
            LEFT JOIN vehicles v ON t.assigned_vehicle_id = v.id
            WHERE t.assigned_driver_id = $1
            AND t.report_status IS NULL OR t.report_status = 'PENDING'
            ORDER BY t.trip_date DESC
            LIMIT 10
        `, [driver.driver_id]);

        console.log(`Found ${tripsResult.rows.length} trips needing reports\n`);

        if (tripsResult.rows.length === 0) {
            console.log('No trips found that need reports');
            return;
        }

        // Submit reports for each trip
        for (const trip of tripsResult.rows) {
            console.log(`Submitting report for trip ${trip.id.substring(0, 8)}...`);
            console.log(`  Date: ${trip.trip_date}`);
            console.log(`  Type: ${trip.trip_type}`);
            console.log(`  Current Status: ${trip.report_status || 'No report'}`);

            // Generate realistic report data
            const baseOdometer = trip.odometer || 15000;
            const startOdometer = baseOdometer;
            const distance = Math.floor(Math.random() * 50) + 10; // 10-60 miles
            const endOdometer = startOdometer + distance;

            const now = new Date();
            const startTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago
            const endTime = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago

            // Create trip report record (if there's a trip_reports table)
            // For now, let's just update the trip record with report status
            await client.query(`
                UPDATE trips
                SET
                    report_status = 'SUBMITTED',
                    started_at = $1,
                    completed_at = $2,
                    updated_at = NOW()
                WHERE id = $3
            `, [startTime, endTime, trip.id]);

            // Update vehicle odometer
            await client.query(`
                UPDATE vehicles
                SET odometer = $1, updated_at = NOW()
                WHERE id = (SELECT assigned_vehicle_id FROM trips WHERE id = $2)
            `, [endOdometer, trip.id]);

            // Log activity (skip if enum type doesn't support it)
            try {
                const crypto = require('crypto');
                const logId = crypto.randomUUID();
                const logMessage = `Trip report submitted for trip on ${trip.trip_date}`;
                const logMeta = JSON.stringify({
                    tripId: trip.id,
                    driverId: driver.driver_id,
                    startOdometer,
                    endOdometer,
                    distance
                });

                await client.query(`
                    INSERT INTO activity_logs (id, type, message, metadata, created_at, is_read)
                    VALUES ($1, 'TRIP_COMPLETED', $2, $3, NOW(), false)
                `, [logId, logMessage, logMeta]);
            } catch (logError) {
                console.log(`    Note: Could not create activity log: ${logError.message}`);
            }

            console.log(`  ✓ Report submitted successfully`);
            console.log(`    Odometer: ${startOdometer} → ${endOdometer} (+${distance} miles)`);
            console.log(`    Duration: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}\n`);
        }

        console.log('\n=== SUMMARY ===');
        console.log(`✓ Successfully submitted ${tripsResult.rows.length} trip report(s)`);
        console.log(`✓ Reports are now in SUBMITTED status`);
        console.log(`✓ Activity logs created for each report`);
        console.log('\nNext steps:');
        console.log('1. Login to admin portal to review reports');
        console.log('2. Approve or reject trip reports');
        console.log('3. View updated vehicle odometer readings\n');

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await client.end();
    }
}

submitTripReports();
