const { Client } = require('pg');
require('dotenv').config();

async function updateTripDates() {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day

        // Update trips that are dated January 20, 2026 to today
        const result = await client.query(`
            UPDATE trips
            SET trip_date = $1, updated_at = NOW()
            WHERE trip_date = '2026-01-20'
            RETURNING id, trip_date, trip_type, status
        `, [today]);

        console.log(`✓ Updated ${result.rows.length} trip(s) to today's date\n`);

        if (result.rows.length > 0) {
            console.log('Updated trips:');
            result.rows.forEach((trip, index) => {
                console.log(`${index + 1}. Trip ${trip.id.substring(0, 8)}...`);
                console.log(`   New Date: ${trip.trip_date}`);
                console.log(`   Type: ${trip.trip_type}`);
                console.log(`   Status: ${trip.status}`);
            });
        } else {
            console.log('No trips found with date 2026-01-20');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

updateTripDates();
