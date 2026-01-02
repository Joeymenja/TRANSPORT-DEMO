const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

const sql = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mobility_requirement') THEN
        CREATE TYPE mobility_requirement AS ENUM ('AMBULATORY', 'WHEELCHAIR', 'STRETCHER', 'BURIATRIC_WHEELCHAIR');
    END IF;
END $$;

ALTER TABLE members ADD COLUMN IF NOT EXISTS mobility_requirement mobility_requirement DEFAULT 'AMBULATORY';
ALTER TABLE members ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS insurance_id VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE members ADD COLUMN IF NOT EXISTS special_notes TEXT;
`;

async function run() {
    await client.connect();
    try {
        await client.query(sql);
        console.log('Database updated successfully');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

run();
