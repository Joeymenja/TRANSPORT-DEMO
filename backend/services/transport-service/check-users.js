const { Client } = require('pg');

async function checkUsers() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'gvbh_transport',
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        const res = await client.query('SELECT id, email, role, organization_id, is_active FROM users');
        console.log('Users found:', res.rows);

    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
