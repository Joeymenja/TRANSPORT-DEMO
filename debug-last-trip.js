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
        
        console.log('--- Most Recent Trips ---');
        const trips = await client.query(`
            SELECT t.id, t.trip_date, t.assigned_driver_id, t.organization_id, t.status, t.created_by_id, t.created_at
            FROM trips t
            ORDER BY t.created_at DESC
            LIMIT 3
        `);
        
        trips.rows.forEach(t => {
            console.log(`Trip ID: ${t.id}`);
            console.log(`  Date: ${t.trip_date}`);
            console.log(`  Created At: ${t.created_at}`);
            console.log(`  Org: ${t.organization_id}`);
            console.log(`  Driver: ${t.assigned_driver_id}`);
            console.log(`  Status: ${t.status}`);
            console.log('-----------------------------------');
        });

        console.log('\n--- Drivers ---');
        const drivers = await client.query('SELECT id, user_id, is_active FROM drivers');
        drivers.rows.forEach(d => console.log(`Driver ID: ${d.id}, User ID: ${d.user_id}, Active: ${d.is_active}`));

        console.log('\n--- Users ---');
        const users = await client.query('SELECT id, email, organization_id FROM users');
        users.rows.forEach(u => console.log(`User ID: ${u.id}, Email: ${u.email}, Org: ${u.organization_id}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
