const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport', // FORCE THIS
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to gvbh_transport');

        console.log('Adding phone column...');
        await client.query('ALTER TABLE public.users ADD COLUMN phone VARCHAR;');
        console.log('Phone column added.');

    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await client.end();
    }
}

run();
