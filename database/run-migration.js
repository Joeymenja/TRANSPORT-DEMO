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
    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Please provide a SQL file path');
        process.exit(1);
    }

    try {
        await client.connect();
        const sql = fs.readFileSync(sqlFile, 'utf8');
        await client.query(sql);
        console.log('Successfully executed:', sqlFile);
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
