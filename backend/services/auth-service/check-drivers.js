const { Client } = require('pg');
require('dotenv').config();

async function checkDrivers() {
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

        // Get all driver accounts
        const result = await client.query(`
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                u.is_active,
                u.password_hash,
                d.license_number,
                d.license_state,
                d.is_active as driver_is_active
            FROM users u
            LEFT JOIN drivers d ON u.id = d.user_id
            WHERE u.role = 'DRIVER'
            ORDER BY u.created_at DESC
        `);

        if (result.rows.length === 0) {
            console.log('No driver accounts found in the database.');
        } else {
            console.log(`Found ${result.rows.length} driver account(s):\n`);
            result.rows.forEach((driver, index) => {
                console.log(`${index + 1}. ${driver.first_name} ${driver.last_name}`);
                console.log(`   Email: ${driver.email}`);
                console.log(`   User Active: ${driver.is_active}`);
                console.log(`   Driver Active: ${driver.driver_is_active ?? 'N/A'}`);
                console.log(`   Has Password: ${driver.password_hash ? 'Yes' : 'No'}`);
                console.log(`   License: ${driver.license_number || 'N/A'} (${driver.license_state || 'N/A'})`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await client.end();
    }
}

checkDrivers();
