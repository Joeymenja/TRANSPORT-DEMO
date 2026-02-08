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
        
        console.log('--- Database Info ---');
        
        const orgs = await client.query('SELECT id, name, subdomain FROM organizations');
        console.log('Organizations:', orgs.rows);
        
        const drivers = await client.query(`
            SELECT d.id as driver_id, u.email, u.first_name, u.last_name, d.organization_id 
            FROM drivers d 
            JOIN users u ON d.user_id = u.id
        `);
        console.log('Drivers:', drivers.rows);
        
        const members = await client.query('SELECT id, first_name, last_name FROM members LIMIT 5');
        console.log('Members:', members.rows);

        const trips = await client.query('SELECT id, status, trip_date FROM trips');
        console.log('Existing Trips:', trips.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
