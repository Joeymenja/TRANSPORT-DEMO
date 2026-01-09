const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport', // Corrected database name
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'vehicle_maintenance';
        `);
        
        if (res.rows.length > 0) {
            console.log('TABLE_EXISTS: vehicle_maintenance');
        } else {
            console.log('TABLE_MISSING: vehicle_maintenance');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
