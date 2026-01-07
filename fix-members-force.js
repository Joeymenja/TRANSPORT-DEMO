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
        
        console.log('Adding missing columns to members table (Force)...');
        
        // Add columns individually to avoid syntax issues with IF NOT EXISTS in some PG versions or block logic
        const columns = [
            "mobility_requirement VARCHAR",
            "insurance_provider VARCHAR",
            "insurance_id VARCHAR",
            "emergency_contact_name VARCHAR",
            "emergency_contact_phone VARCHAR",
            "special_notes TEXT",
            "gender VARCHAR",
            "consent_date TIMESTAMP",
            "medical_notes TEXT",
            "is_active BOOLEAN DEFAULT true",
            "consent_on_file BOOLEAN DEFAULT false",
            "report_type VARCHAR DEFAULT 'NATIVE'"
        ];

        for (const col of columns) {
            try {
                // Remove IF NOT EXISTS for now, or catch error if exists
                await client.query(`ALTER TABLE members ADD COLUMN ${col}`);
                console.log(`Added ${col.split(' ')[0]}`);
            } catch (e) {
                if (e.code === '42701') { // duplicate_column
                    console.log(`Column ${col.split(' ')[0]} already exists`);
                } else {
                    console.error(`Failed to add ${col}:`, e.message);
                }
            }
        }
        
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
