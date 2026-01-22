const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function createHouseManager() {
    console.log('--- CREATING HOUSE MANAGER ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get Organization
        let orgId;
        const orgRes = await client.query("SELECT id FROM organizations LIMIT 1");
        if (orgRes.rows.length > 0) {
            orgId = orgRes.rows[0].id;
            console.log(`Using Organization ID: ${orgId}`);
        } else {
            console.error('No organizations found! Please verify DB state.');
            process.exit(1);
        }

        const email = 'carmen@greatvalleybh.org';
        const rawPassword = 'password123'; 
        
        // Check if exists
        const userRes = await client.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userRes.rows.length > 0) {
            console.log('User already exists, updating role/password...');
            const passwordHash = await bcrypt.hash(rawPassword, 10);
            await client.query(
                `UPDATE users SET role = 'HOUSE_MANAGER', password_hash = $1, first_name = 'Carmen', last_name = 'Manager', is_active = true WHERE email = $2`,
                [passwordHash, email]
            );
        } else {
            console.log('Creating new user...');
            const userId = uuidv4();
            const passwordHash = await bcrypt.hash(rawPassword, 10);
            await client.query(
                `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_active) 
                 VALUES ($1, $2, $3, $4, 'Carmen', 'Manager', 'HOUSE_MANAGER', true)`,
                [userId, orgId, email, passwordHash]
            );
        }

        console.log(`House Manager user ${email} created/updated successfully.`);

    } catch (err) {
        console.error('Error creating house manager:', err);
    } finally {
        await client.end();
    }
}

createHouseManager();
