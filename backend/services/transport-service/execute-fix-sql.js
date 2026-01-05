const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// We use the same credentials as verified before
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
        console.log('Connected to DB');
        const sql = fs.readFileSync('/Users/joel/TRANSPORT-DEMO/database/fix_missing_columns.sql', 'utf-8');
        await client.query(sql);
        console.log('Schema update executed successfully.');
    } catch (err) {
        console.error('Error executing schema update:', err);
    } finally {
        await client.end();
    }
}

run();
