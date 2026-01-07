const { Client } = require('pg');
require('dotenv').config();

async function createProperTripReports() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        await client.connect();
        console.log('Creating proper trip reports...\n');

        // Get trips that need reports
        const trips = await client.query(`
            SELECT
                t.id as trip_id,
                t.trip_date,
                t.assigned_driver_id,
                t.organization_id,
                t.assigned_vehicle_id,
                v.odometer,
                u.first_name,
                u.last_name,
                tm.member_id
            FROM trips t
            LEFT JOIN vehicles v ON t.assigned_vehicle_id = v.id
            LEFT JOIN drivers d ON t.assigned_driver_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN trip_members tm ON t.id = tm.trip_id
            WHERE t.trip_date >= CURRENT_DATE - INTERVAL '7 days'
            AND t.assigned_driver_id IS NOT NULL
            GROUP BY t.id, t.trip_date, t.assigned_driver_id, t.organization_id,
                     t.assigned_vehicle_id, v.odometer, u.first_name, u.last_name, tm.member_id
            ORDER BY t.trip_date DESC
        `);

        console.log(`Found ${trips.rows.length} trips to create reports for\n`);

        const crypto = require('crypto');

        for (const trip of trips.rows) {
            // Check if report already exists
            const existingReport = await client.query(
                'SELECT id FROM trip_reports WHERE trip_id = $1',
                [trip.trip_id]
            );

            if (existingReport.rows.length > 0) {
                console.log(`✓ Report already exists for trip ${trip.trip_id.substring(0, 8)}...`);
                continue;
            }

            const reportId = crypto.randomUUID();
            const baseOdometer = trip.odometer || 15000;
            const distance = Math.floor(Math.random() * 50) + 15; // 15-65 miles
            const startOdometer = baseOdometer;
            const endOdometer = baseOdometer + distance;

            const now = new Date();
            const pickupTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago
            const dropoffTime = new Date(now.getTime() - (1 * 60 * 60 * 1000)); // 1 hour ago

            // Create trip report
            await client.query(`
                INSERT INTO trip_reports (
                    id, organization_id, trip_id, member_id, driver_id, status,
                    start_odometer, end_odometer, total_miles,
                    pickup_time, dropoff_time,
                    service_verified, client_arrived,
                    incident_reported, driver_attestation,
                    notes, submitted_at,
                    created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, 'SUBMITTED', $6, $7, $8, $9, $10, true, true, false, true, $11, NOW(), NOW(), NOW())
            `, [
                reportId,
                trip.organization_id,
                trip.trip_id,
                trip.member_id,
                trip.assigned_driver_id,
                startOdometer,
                endOdometer,
                distance,
                pickupTime,
                dropoffTime,
                'Trip completed successfully. All passengers transported safely.'
            ]);

            // Update vehicle odometer
            await client.query(`
                UPDATE vehicles
                SET odometer = $1, updated_at = NOW()
                WHERE id = $2
            `, [endOdometer, trip.assigned_vehicle_id]);

            // Update trip status
            await client.query(`
                UPDATE trips
                SET report_status = 'SUBMITTED',
                    started_at = $1,
                    completed_at = $2,
                    updated_at = NOW()
                WHERE id = $3
            `, [pickupTime, dropoffTime, trip.trip_id]);

            // Create notification
            const notificationId = crypto.randomUUID();
            const driverName = trip.first_name && trip.last_name
                ? `${trip.first_name} ${trip.last_name}`
                : 'Driver';

            await client.query(`
                INSERT INTO notifications (
                    id, organization_id, type, title, message, status, metadata, created_at
                )
                VALUES ($1, $2, 'TRIP_REPORT_SUBMITTED', $3, $4, 'UNREAD', $5, NOW())
            `, [
                notificationId,
                trip.organization_id,
                'Trip Report Submitted',
                `A trip report has been submitted by ${driverName} and is ready for review`,
                JSON.stringify({
                    tripId: trip.trip_id,
                    tripReportId: reportId,
                    driverId: trip.assigned_driver_id
                })
            ]);

            console.log(`✓ Created report for trip ${trip.trip_id.substring(0, 8)}...`);
            console.log(`  Driver: ${driverName}`);
            console.log(`  Odometer: ${startOdometer} → ${endOdometer} (+${distance} miles)`);
            console.log(`  Notification created`);
            console.log('');
        }

        // Final check
        const reportCount = await client.query('SELECT COUNT(*) FROM trip_reports');
        const notificationCount = await client.query('SELECT COUNT(*) FROM notifications');

        console.log('\n=== SUMMARY ===');
        console.log(`✓ Trip Reports Created: ${reportCount.rows[0].count}`);
        console.log(`✓ Notifications Created: ${notificationCount.rows[0].count}`);
        console.log('\nNow check the admin portal - you should see:');
        console.log('1. Notification bell with unread count');
        console.log('2. Trip reports visible in the Reports page');
        console.log('3. Trip details when clicking on a trip\n');

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    } finally {
        await client.end();
    }
}

createProperTripReports();
