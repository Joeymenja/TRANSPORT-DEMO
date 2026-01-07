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
        
        console.log('--- Checking Activity Logs ---');
        const res = await client.query(`
            SELECT id, type, message, created_at
            FROM activity_logs 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        if (res.rows.length === 0) {
            console.log('No activity logs found.');
        } else {
            res.rows.forEach(r => {
                console.log(`[${r.created_at}] ${r.type}: ${r.message}`);
            });
        }
        
        // Check schema for organization_id
        const schema = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'activity_logs' AND column_name = 'organization_id'
        `);
        
        console.log('Has organization_id column:', schema.rows.length > 0);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
