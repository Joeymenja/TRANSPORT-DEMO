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
        
        const trips = await client.query(`
            SELECT t.id, t.status, t.trip_date, u.email as driver_email
            FROM trips t
            LEFT JOIN drivers d ON t.assigned_driver_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);
        console.log('Last 5 Trips:', trips.rows);
        
        const tripId = trips.rows[0].id;
        const stops = await client.query('SELECT id, stop_type, address FROM trip_stops WHERE trip_id = $1', [tripId]);
        console.log(`Stops for Trip ${tripId}:`, stops.rows);

        const members = await client.query('SELECT m.first_name, tm.member_status FROM trip_members tm JOIN members m ON tm.member_id = m.id WHERE tm.trip_id = $1', [tripId]);
        console.log(`Members for Trip ${tripId}:`, members.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
