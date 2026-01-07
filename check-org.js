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
        
        console.log('--- Checking Organization ---');
        const orgs = await client.query('SELECT * FROM organizations');
        console.log('Organizations found:', orgs.rows.length);
        if (orgs.rows.length > 0) {
            console.log('First Org ID:', orgs.rows[0].id);
            console.log('First Org Name:', orgs.rows[0].name);
        } else {
            console.log('NO ORGANIZATIONS FOUND!');
        }

        console.log('\n--- Checking User & Driver ---');
        const userRes = await client.query("SELECT id, email FROM users WHERE email = 'new.driver@gvbh.com'");
        if (userRes.rows.length === 0) {
            console.log('User new.driver@gvbh.com NOT FOUND');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log('User ID:', userId);

        const driverRes = await client.query("SELECT id, organization_id FROM drivers WHERE user_id = $1", [userId]);
        if (driverRes.rows.length === 0) {
            console.log('Driver profile NOT FOUND for this user');
        } else {
            console.log('Driver ID:', driverRes.rows[0].id);
            console.log('Driver Organization ID:', driverRes.rows[0].organization_id);
            
            if (!driverRes.rows[0].organization_id) {
                console.log('FAIL: Driver exists but has NO organization_id');
                // Auto-fix if org exists
                if (orgs.rows.length > 0) {
                   const orgId = orgs.rows[0].id;
                   console.log(`Auto-assigning Organization ${orgId} to driver...`);
                   await client.query("UPDATE drivers SET organization_id = $1 WHERE id = $2", [orgId, driverRes.rows[0].id]);
                   console.log('Organization assigned to driver.');
                }
            } else {
                console.log('SUCCESS: Driver has organization_id');
            }
        }

        console.log('\n--- Checking User Organization ---');
        const userOrgRes = await client.query("SELECT organization_id FROM users WHERE id = $1", [userId]);
        const userOrgId = userOrgRes.rows[0].organization_id;
        console.log('User Organization ID:', userOrgId);

        if (!userOrgId) {
             console.log('FAIL: User has NO organization_id. This causes Auth Service to return null orgId.');
             if (orgs.rows.length > 0) {
                const orgId = orgs.rows[0].id; // Use the first org found
                console.log(`Auto-assigning Organization ${orgId} to USER...`);
                await client.query("UPDATE users SET organization_id = $1 WHERE id = $2", [orgId, userId]);
                console.log('Organization assigned to User.');
             }
        } else {
            console.log('SUCCESS: User has organization_id');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
