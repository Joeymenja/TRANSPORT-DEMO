const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default DB to list others
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database;');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
