import { Client } from 'pg';

async function fixDatabaseSchema() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'gvbh_transport',
    });
    await client.connect();
    try {
        console.log('Fixing DB schema...');

        // 1. Drop check constraint on trips status
        await client.query('ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_status_check');
        console.log('Dropped trips_status_check constraint.');

        // 2. Add PENDING_APPROVAL to enum if it exists
        try {
            await client.query("ALTER TYPE trip_status_enum ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL'");
            console.log("Added PENDING_APPROVAL to trip_status_enum.");
        } catch (e) {
            console.log("Enum update skipped/failed (might not be an enum):", e.message);
        }

    } catch (e) {
        console.log('DB Fix error:', e.message);
    } finally {
        await client.end();
    }
}

fixDatabaseSchema();
