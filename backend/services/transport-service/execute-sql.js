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

        // Read SQL file
        const sqlFile = process.argv[2];
        if (!sqlFile) {
            console.error('Please provide a SQL file path as a command-line argument.');
            process.exit(1);
        }
        console.log(`Reading SQL from: ${sqlFile}`);
        if (!fs.existsSync(sqlFile)) {
            throw new Error(`SQL file not found at ${sqlFile}`);
        }

        const sql = fs.readFileSync(sqlFile, 'utf8');
        console.log('Executing SQL...');

        const res = await client.query(sql);
        console.log('SQL executed successfully');
        console.table(res.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
