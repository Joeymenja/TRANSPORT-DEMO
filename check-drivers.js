const { Client } = require('pg');

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
        const res = await client.query(`
            SELECT u.email, u.first_name, u.last_name, d.license_number 
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE u.email LIKE '%@gvbh.com'
        `);
        console.log('Verified Drivers (Joined):', res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
