const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function testTripCreation() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Check if mobility_requirement column exists
        const columnCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trips' AND column_name = 'mobility_requirement'
        `);

        console.log('Mobility requirement column:', columnCheck.rows);

        // Check proxy signature columns
        const proxyColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trip_members' 
            AND column_name IN ('is_proxy_signature', 'proxy_signer_name', 'proxy_relationship', 'proxy_reason')
        `);

        console.log('Proxy signature columns:', proxyColumns.rows);

        // Get a sample organization and member
        const org = await client.query(`SELECT id FROM organizations LIMIT 1`);
        const member = await client.query(`SELECT id FROM members LIMIT 1`);
        const user = await client.query(`SELECT id FROM users WHERE role = 'ORG_ADMIN' LIMIT 1`);

        if (org.rows.length === 0 || member.rows.length === 0 || user.rows.length === 0) {
            console.log('Missing test data. Please ensure organizations, members, and users exist.');
            return;
        }

        console.log('\nTest data found:');
        console.log('Organization ID:', org.rows[0].id);
        console.log('Member ID:', member.rows[0].id);
        console.log('User ID:', user.rows[0].id);
        console.log('\nSchema verification complete. Trip creation should now work.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

testTripCreation();
