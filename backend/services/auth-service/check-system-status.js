const { Client } = require('pg');
require('dotenv').config();

async function checkSystemStatus() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        await client.connect();
        console.log('=== SYSTEM STATUS CHECK ===\n');

        // 1. Check trips
        const trips = await client.query(`
            SELECT
                t.id,
                t.trip_date,
                t.trip_type,
                t.status,
                t.report_status,
                t.assigned_driver_id,
                t.started_at,
                t.completed_at
            FROM trips t
            WHERE t.trip_date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY t.trip_date DESC
        `);

        console.log(`📅 TRIPS (last 7 days): ${trips.rows.length} found\n`);
        trips.rows.forEach((trip, i) => {
            console.log(`${i + 1}. Trip ${trip.id.substring(0, 8)}...`);
            console.log(`   Date: ${trip.trip_date}`);
            console.log(`   Type: ${trip.trip_type}`);
            console.log(`   Status: ${trip.status}`);
            console.log(`   Report Status: ${trip.report_status || 'NO REPORT'}`);
            console.log(`   Driver ID: ${trip.assigned_driver_id ? trip.assigned_driver_id.substring(0, 8) + '...' : 'None'}`);
            console.log(`   Started: ${trip.started_at || 'Not started'}`);
            console.log(`   Completed: ${trip.completed_at || 'Not completed'}`);
            console.log('');
        });

        // 2. Check trip reports
        const reports = await client.query(`
            SELECT
                tr.id,
                tr.trip_id,
                tr.status,
                tr.driver_id,
                tr.start_odometer,
                tr.end_odometer,
                tr.created_at
            FROM trip_reports tr
            ORDER BY tr.created_at DESC
            LIMIT 10
        `);

        console.log(`📋 TRIP REPORTS: ${reports.rows.length} found\n`);
        if (reports.rows.length > 0) {
            reports.rows.forEach((report, i) => {
                console.log(`${i + 1}. Report ${report.id.substring(0, 8)}...`);
                console.log(`   Trip ID: ${report.trip_id.substring(0, 8)}...`);
                console.log(`   Status: ${report.status}`);
                console.log(`   Driver: ${report.driver_id ? report.driver_id.substring(0, 8) + '...' : 'None'}`);
                console.log(`   Odometer: ${report.start_odometer} → ${report.end_odometer}`);
                console.log(`   Created: ${report.created_at}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No trip reports found!\n');
        }

        // 3. Check notifications
        const notifications = await client.query(`
            SELECT
                n.id,
                n.type,
                n.title,
                n.message,
                n.status,
                n.created_at
            FROM notifications n
            ORDER BY n.created_at DESC
            LIMIT 10
        `);

        console.log(`🔔 NOTIFICATIONS: ${notifications.rows.length} found\n`);
        if (notifications.rows.length > 0) {
            notifications.rows.forEach((notif, i) => {
                console.log(`${i + 1}. [${notif.status}] ${notif.type}`);
                console.log(`   Title: ${notif.title}`);
                console.log(`   Message: ${notif.message}`);
                console.log(`   Created: ${notif.created_at}`);
                console.log('');
            });
        } else {
            console.log('   ❌ No notifications found!\n');
        }

        // 4. Check drivers
        const drivers = await client.query(`
            SELECT
                d.id,
                u.email,
                u.first_name,
                u.last_name,
                u.is_active as user_active,
                d.is_active as driver_active
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
        `);

        console.log(`👨‍✈️ DRIVERS: ${drivers.rows.length} found\n`);
        drivers.rows.forEach((driver, i) => {
            console.log(`${i + 1}. ${driver.first_name} ${driver.last_name}`);
            console.log(`   Email: ${driver.email}`);
            console.log(`   User Active: ${driver.user_active}`);
            console.log(`   Driver Active: ${driver.driver_active}`);
            console.log(`   Driver ID: ${driver.id.substring(0, 8)}...`);
            console.log('');
        });

        console.log('=== SUMMARY ===');
        console.log(`Trips: ${trips.rows.length}`);
        console.log(`Trip Reports: ${reports.rows.length}`);
        console.log(`Notifications: ${notifications.rows.length}`);
        console.log(`Drivers: ${drivers.rows.length}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

checkSystemStatus();
