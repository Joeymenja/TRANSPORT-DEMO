const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function checkTripReports() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'trip_reports'
        `);

        if (res.rows.length > 0) {
            console.log('✅ Table `trip_reports` exists.');

            // Check columns
            const cols = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'trip_reports'
            `);
            console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));
        } else {
            console.log('❌ Table `trip_reports` does NOT exist yet. (TypeORM sync needed)');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkTripReports();
