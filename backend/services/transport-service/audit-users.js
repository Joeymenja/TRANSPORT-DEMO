const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function audit() {
    await client.connect();
    const res = await client.query("SELECT id, email, role FROM users");
    for (const row of res.rows) {
        console.log(`ID: ${row.id} | Email: ${row.email} | Role: ${row.role}`);
    }
    await client.end();
}

audit().catch(console.error);
