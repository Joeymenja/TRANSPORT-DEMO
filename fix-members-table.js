const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        
        console.log('Adding missing columns to members table...');
        
        await client.query(`
            ALTER TABLE members 
            ADD COLUMN IF NOT EXISTS mobility_requirement VARCHAR,
            ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR,
            ADD COLUMN IF NOT EXISTS insurance_id VARCHAR,
            ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR,
            ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR,
            ADD COLUMN IF NOT EXISTS special_notes TEXT,
            ADD COLUMN IF NOT EXISTS gender VARCHAR,
            ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS medical_notes TEXT,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS consent_on_file BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS report_type VARCHAR DEFAULT 'NATIVE';
        `);
        
        console.log('Columns added successfully.');

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
