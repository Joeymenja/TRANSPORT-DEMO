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

        // Explicitly check for phone column first
        const check = await client.query("SELECT attname FROM pg_attribute WHERE attrelid = 'public.users'::regclass AND attname = 'phone'");
        if (check.rowCount > 0) {
            console.log('Phone column ALREADY exists (via pg_attribute).');
        } else {
            console.log('Phone column MISSING. Adding...');
            await client.query('ALTER TABLE users ADD COLUMN phone VARCHAR');
            console.log('ALTER TABLE executed.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
