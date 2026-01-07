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
        
        console.log('--- Checking Trip Reports Constraints ---');
        const res = await client.query(`
            SELECT conname, confrelid::regclass 
            FROM pg_constraint 
            WHERE conrelid = 'trip_reports'::regclass;
        `);
        
        if (res.rows.length === 0) {
            console.log('No constraints found on "trip_reports"');
        } else {
            console.log('Constraints found:');
            res.rows.forEach(r => {
                console.log(`- ${r.conname} (references ${r.confrelid})`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
