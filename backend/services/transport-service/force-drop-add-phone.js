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

        console.log('Dropping phone column...');
        await client.query('ALTER TABLE users DROP COLUMN IF EXISTS phone');
        console.log('Column dropped.');

        console.log('Adding phone column...');
        await client.query('ALTER TABLE users ADD COLUMN phone VARCHAR');
        console.log('Column added.');

        console.log('Verifying...');
        const res = await client.query('SELECT phone FROM users LIMIT 1');
        console.log('SELECT phone SUCCESS');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
