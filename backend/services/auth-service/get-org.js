const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gvbh_transport',
});

(async () => {
    await client.connect();
    const res = await client.query('SELECT id, name FROM organizations LIMIT 1');
    console.log(res.rows[0]);
    await client.end();
})();
