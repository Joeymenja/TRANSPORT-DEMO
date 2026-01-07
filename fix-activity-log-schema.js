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
        
        console.log('Adding organization_id to activity_logs...');
        await client.query(`
            ALTER TABLE activity_logs 
            ADD COLUMN IF NOT EXISTS organization_id UUID;
        `);
        
        console.log('Backfilling organization_id for existing logs...');
        // Default to the main demo organization ID
        const demoOrgId = 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00';
        await client.query(`
            UPDATE activity_logs 
            SET organization_id = $1 
            WHERE organization_id IS NULL;
        `, [demoOrgId]);
        
        console.log('Migration complete.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
