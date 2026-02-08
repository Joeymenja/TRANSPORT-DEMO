const { Client } = require('pg');

const dbConfig = { 
    host: 'localhost', 
    database: 'gvbh_transport', 
    user: 'postgres', 
    password: 'postgres', 
    port: 5432 
};

async function fixData() {
    console.log('--- FIXING DATA ---');
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        // Get target org from John Doe
        const res = await client.query("SELECT organization_id FROM members WHERE email = 'test.member@example.com' LIMIT 1");
        if (res.rows.length === 0) {
            console.error('Member not found. Cannot determine org to fix.');
            return;
        }
        const orgId = res.rows[0].organization_id;
        console.log(`Target Org ID: ${orgId}`);

        // Update Org to have subdomain
        await client.query("UPDATE organizations SET subdomain = 'gvbh-demo', name = 'Great Values Transportation' WHERE id = $1", [orgId]);
        console.log('Updated Organization with subdomain "gvbh-demo"');

        // Verify
        const verify = await client.query("SELECT * FROM organizations WHERE id = $1", [orgId]);
        console.log(`Verification: ${verify.rows[0].subdomain}`);

    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
}
fixData();
