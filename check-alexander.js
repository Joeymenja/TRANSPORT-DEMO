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
            SELECT d.id, u.email, d.organization_id, d.assigned_vehicle_id 
            FROM drivers d 
            JOIN users u ON d.user_id = u.id 
            WHERE u.email = 'alexander.gichungu@gvbh.com'
        `);
        console.log('Driver Info:', res.rows[0]);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
