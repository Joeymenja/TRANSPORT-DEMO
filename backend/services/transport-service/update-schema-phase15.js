const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function updateSchema() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Phase 15: Mobility Requirement
        console.log('Adding mobility_requirement to trips table...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trips_mobility_requirement_enum') THEN
                    CREATE TYPE trips_mobility_requirement_enum AS ENUM ('AMBULATORY', 'WHEELCHAIR', 'STRETCHER', 'CAR_SEAT');
                END IF;
            END $$;
        `);
        await client.query(`ALTER TABLE trips ADD COLUMN IF NOT EXISTS mobility_requirement trips_mobility_requirement_enum DEFAULT 'AMBULATORY'`);

        // Phase 14: Proxy Signatures (checking if already exists)
        console.log('Adding proxy signature fields to trip_members table...');
        await client.query(`ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS is_proxy_signature BOOLEAN DEFAULT false`);
        await client.query(`ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS proxy_signer_name VARCHAR`);
        await client.query(`ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS proxy_relationship VARCHAR`);
        await client.query(`ALTER TABLE trip_members ADD COLUMN IF NOT EXISTS proxy_reason VARCHAR`);

        console.log('Schema update completed successfully.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
