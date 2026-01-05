const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function truncateAll() {
    try {
        await client.connect();

        // Truncate all tables
        await client.query(`
            TRUNCATE TABLE 
                trips, 
                trip_members, 
                trip_stops, 
                vehicles, 
                members, 
                users, 
                vehicle_maintenance, 
                vehicle_documents, 
                drivers, 
                signatures
            CASCADE
        `);
        // TripReport might not exist yet, so we exclude it or catch error
        try {
            await client.query('TRUNCATE TABLE trip_reports CASCADE');
        } catch (e) {
            console.log('trip_reports might not exist yet');
        }

        console.log('Truncated ALL tables.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

truncateAll();
