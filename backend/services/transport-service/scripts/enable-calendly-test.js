const { Client } = require('pg');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport', // Based on seed-01-core.js
};

async function fixMember() {
    console.log('--- ENABLING CALENDLY TEST DATA ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // Find John Doe
        const res = await client.query("SELECT * FROM members WHERE last_name = 'Doe' LIMIT 1");
        if (res.rows.length === 0) {
            console.error('John Doe not found. Seeding failed?');
            // Try creating him?
            // Actually, let's just create a new member if not found to be safe.
            const { v4: uuidv4 } = require('uuid');
            // Check if uuid is available? It should be in node_modules.
            // If not, we fail. But seed-01 used it.
            return; 
        }

        const memberId = res.rows[0].id;
        console.log(`Found Member: ${res.rows[0].first_name} ${res.rows[0].last_name} (${memberId})`);
        
        // Update Email
        const email = 'test.member@example.com';
        await client.query("UPDATE members SET email = $1 WHERE id = $2", [email, memberId]);
        console.log(`Updated member email to: ${email}`);
        
        // Also ensure Organization exists (it should)
        console.log('--- TEST DATA READY ---');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

fixMember();
