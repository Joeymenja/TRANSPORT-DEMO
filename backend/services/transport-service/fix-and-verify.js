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
        console.log('Connected to gvbh_transport');

        // Check if phone column exists
        let checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'phone';
        `);

        if (checkRes.rowCount === 0) {
            console.log('Phone column missing. Adding it...');
            await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;');
            console.log('ALTER TABLE executed.');
        } else {
            console.log('Phone column already exists (according to schema).');
        }

        // Verify again
        checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'phone';
        `);
        console.log('Phone column check after update:', checkRes.rowCount > 0 ? 'FOUND' : 'MISSING');

        // Select from table to be sure
        try {
            await client.query('SELECT phone FROM users LIMIT 1');
            console.log('SELECT phone FROM users succeeded.');
        } catch (e) {
            console.error('SELECT phone FROM users FAILED:', e.message);
        }

        // Add other columns from the fix list just in case
        const otherCols = [
            "ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR",
            "ADD COLUMN IF NOT EXISTS dob DATE",
            "ADD COLUMN IF NOT EXISTS address_street VARCHAR",
            "ADD COLUMN IF NOT EXISTS address_unit VARCHAR",
            "ADD COLUMN IF NOT EXISTS address_city VARCHAR",
            "ADD COLUMN IF NOT EXISTS address_state VARCHAR",
            "ADD COLUMN IF NOT EXISTS address_zip VARCHAR",
            "ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR",
            "ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR",
            "ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR",
            "ADD COLUMN IF NOT EXISTS default_vehicle_id VARCHAR",
            "ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0",
            "ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE"
        ];

        for (const colSql of otherCols) {
            await client.query(`ALTER TABLE users ${colSql}`);
        }
        console.log('Other columns ensured.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
