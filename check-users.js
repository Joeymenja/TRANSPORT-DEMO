const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function checkUsers() {
    try {
        await client.connect();
        console.log('Connected to database.\n');

        console.log('=== Checking Users ===');
        const users = await client.query(`
            SELECT id, email, role, is_active, organization_id
            FROM users
            WHERE role IN ('ORG_ADMIN', 'STAFF')
            LIMIT 5
        `);

        console.log(`Found ${users.rows.length} admin/staff users:`);
        users.rows.forEach(user => {
            console.log(`- ${user.email} (${user.role}, active: ${user.is_active})`);
        });

        console.log('\n=== Checking Password Hashes ===');
        const passwordCheck = await client.query(`
            SELECT email, LENGTH(password_hash) as hash_length
            FROM users
            WHERE role = 'ORG_ADMIN'
            LIMIT 3
        `);

        passwordCheck.rows.forEach(user => {
            console.log(`- ${user.email}: hash length = ${user.hash_length}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
