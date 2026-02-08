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
        
        const res = await client.query("SELECT id, email, role, organization_id FROM users WHERE email = 'driver@gvbh-demo.com'");
        console.log('User:', res.rows[0]);
        
        if (res.rows[0]) {
            const orgRes = await client.query("SELECT id, subdomain FROM organizations WHERE id = $1", [res.rows[0].organization_id]);
            console.log('Org:', orgRes.rows[0]);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
