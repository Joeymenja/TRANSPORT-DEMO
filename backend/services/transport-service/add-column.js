const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function addColumn() {
    try {
        await client.connect();

        console.log('Adding default_vehicle_id column to users table...');
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS default_vehicle_id UUID`);
        console.log('Column added successfully.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

addColumn();
