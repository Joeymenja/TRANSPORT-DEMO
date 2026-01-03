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
        console.log('Connected to database.\n');

        console.log('=== Phase 16: Adding Cancellation Fields ===');

        // Add cancellation columns
        console.log('Adding cancellation columns to trips table...');
        await client.query(`
            ALTER TABLE trips 
            ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR,
            ADD COLUMN IF NOT EXISTS cancelled_by UUID,
            ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS no_show_notes TEXT
        `);
        console.log('✅ Cancellation columns added');

        // Add NO_SHOW status to enum
        console.log('\nAdding NO_SHOW status to enum...');
        try {
            await client.query(`ALTER TYPE trips_status_enum ADD VALUE 'NO_SHOW'`);
            console.log('✅ NO_SHOW status added to enum');
        } catch (err) {
            if (err.message && err.message.includes('already exists')) {
                console.log('✅ NO_SHOW status already exists in enum');
            } else {
                console.log('⚠️  Could not add NO_SHOW to enum (may already exist)');
            }
        }

        console.log('\n=== Schema Update Complete ===');
        console.log('Phase 16 database changes applied successfully!');

    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        await client.end();
    }
}

updateSchema();
