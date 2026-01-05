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
        console.log('Connected to database');

        // Path: backend/services/member-service -> root -> database
        const sqlPath = path.resolve(__dirname, '../../../database/fix_missing_columns.sql');
        console.log('Reading SQL from:', sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);
        console.log('SQL executed successfully');

    } catch (err) {
        console.error('Error executing SQL:', err);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

run();
