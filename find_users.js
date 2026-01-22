const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport'
});

async function findUsers() {
    try {
        await client.connect();
        const res = await client.query("SELECT email, role, is_active FROM users LIMIT 10;");
        console.log('--- FOUND USERS ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

findUsers();
