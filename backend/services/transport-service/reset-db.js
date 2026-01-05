const { Client } = require('pg');

async function resetDb() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'gvbh_transport', // Hardcoded DB name inferred from previous context
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        await client.query('TRUNCATE TABLE users, drivers, trips, trip_members, trip_stops, trip_reports, signatures, activity_logs, organizations CASCADE');
        console.log('Tables truncated.');

        // Re-seed Organization (Basic Org)
        await client.query(`
        INSERT INTO organizations (id, name, subdomain, is_active, created_at, updated_at)
        VALUES ('f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00', 'Demo Transport Org', 'demo', true, NOW(), NOW())
    `);
        console.log('Organization re-seeded.');

    } catch (err) {
        console.error('Error resetting DB:', err);
    } finally {
        await client.end();
    }
}

resetDb();
