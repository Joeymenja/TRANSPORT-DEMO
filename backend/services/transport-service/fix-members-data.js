const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function fixMembers() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Update null organization_ids to a default 'org-1'
        const res = await client.query(`
            UPDATE members 
            SET organization_id = 'org-1' 
            WHERE organization_id IS NULL
        `);

        console.log(`Updated ${res.rowCount} members with null organization_id.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

fixMembers();
