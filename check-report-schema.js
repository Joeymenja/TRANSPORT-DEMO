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
        
        console.log('--- Checking Trip Reports Table Schema ---');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trip_reports'
            ORDER BY column_name;
        `);
        
        if (res.rows.length === 0) {
            console.log('Table "trip_reports" NOT FOUND');
        } else {
            console.log('Columns found:', res.rows.map(r => r.column_name).join(', '));
            
            // Check for columns added for PDF/Reporting
            const expectedCols = ['pickup_time', 'dropoff_time', 'total_miles', 'service_verified', 'client_arrived', 'incident_reported', 'incident_description'];
            const missing = expectedCols.filter(col => !res.rows.some(r => r.column_name === col));
            
            if (missing.length > 0) {
                console.log('❌ MISSING COLUMNS:', missing.join(', '));
            } else {
                console.log('✅ All expected columns present.');
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
