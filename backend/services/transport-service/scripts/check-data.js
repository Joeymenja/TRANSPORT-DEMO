const { Client } = require('pg');

const dbConfig = { 
    host: 'localhost', 
    database: 'gvbh_transport', 
    user: 'postgres', 
    password: 'postgres', 
    port: 5432 
};

async function checkData() {
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        console.log('--- CHECKING DATA ---');
        // Organizations
        const orgs = await client.query('SELECT id, name, subdomain FROM organizations');
        console.log(`Orgs found: ${orgs.rows.length}`);
        orgs.rows.forEach(o => console.log(`- ${o.name} (${o.id}) Sub: ${o.subdomain}`));

        // Members with test email
        const members = await client.query("SELECT id, first_name, last_name, email, organization_id FROM members WHERE email = 'test.member@example.com'");
        console.log(`Members found with test email: ${members.rows.length}`);
        members.rows.forEach(m => console.log(`- ${m.first_name} ${m.last_name} (${m.email}) Org: ${m.organization_id}`));

        // Check if Org ID matches
        if (orgs.rows.length > 0 && members.rows.length > 0) {
            console.log(`Org Match: ${orgs.rows[0].id === members.rows[0].organization_id}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
}
checkData();
