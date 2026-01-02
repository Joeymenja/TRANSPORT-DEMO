const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function check() {
    await client.connect();
    const res = await client.query("SELECT id, trip_date, status, created_at FROM trips");
    console.log(JSON.stringify(res.rows, null, 2));

    // Also check today's date from JS perspective
    console.log('JS Date:', new Date().toISOString().split('T')[0]);

    await client.end();
}

check().catch(console.error);
