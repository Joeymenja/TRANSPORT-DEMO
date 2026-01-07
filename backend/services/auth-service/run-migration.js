const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });

    try {
        await client.connect();
        console.log('Connected to database\n');

        const sql = fs.readFileSync('./create-notifications-table.sql', 'utf8');
        await client.query(sql);

        console.log('✓ Notifications table created successfully');
        console.log('✓ Indexes created successfully\n');

    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✓ Notifications table already exists');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await client.end();
    }
}

runMigration();
