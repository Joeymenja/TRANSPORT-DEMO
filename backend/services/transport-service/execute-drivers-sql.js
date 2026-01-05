const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
        const sql = fs.readFileSync('/Users/joel/TRANSPORT-DEMO/database/ensure_drivers_table.sql', 'utf-8');
        await client.query(sql);
        console.log('Ensure drivers table executed.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
