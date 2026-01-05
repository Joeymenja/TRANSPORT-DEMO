const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function truncateTrips() {
    try {
        await client.connect();

        // Cascade to clear referencing tables (trip_stops, trip_members, trip_reports)
        await client.query('TRUNCATE TABLE trips CASCADE');

        console.log('Truncated trips table.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

truncateTrips();
