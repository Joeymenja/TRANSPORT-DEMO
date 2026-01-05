const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport', // Verified this is what auth-service uses
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to gvbh_transport');

        const info = await client.query('SELECT inet_server_addr(), inet_server_port(), version()');
        console.log('Server info:', info.rows[0]);

        // Test 1: Select *
        try {
            const res = await client.query('SELECT * FROM users LIMIT 1');
            if (res.rowCount > 0) {
                console.log('Row keys:', Object.keys(res.rows[0]));
            } else {
                console.log('Table users exists but is empty.');
                // Get column info manually if empty
                const cols = await client.query("SELECT * FROM users WHERE 1=0");
                console.log('Column references from fields:', cols.fields.map(f => f.name));
            }
        } catch (e) {
            console.error('SELECT * FAILED:', e.message);
        }

        // Test 2: Unquoted phone
        try {
            await client.query('SELECT phone FROM users LIMIT 1');
            console.log('SELECT phone FROM users: SUCCESS');
        } catch (e) {
            console.error('SELECT phone FROM users FAILED:', e.message);
        }

        // Test 3: Quoted phone
        try {
            await client.query('SELECT "phone" FROM "users" LIMIT 1');
            console.log('SELECT "phone" FROM "users": SUCCESS');
        } catch (e) {
            console.error('SELECT "phone" FROM "users" FAILED:', e.message);
        }

        // Test 4: Quoted User alias
        try {
            await client.query('SELECT "User"."phone" FROM "users" "User" LIMIT 1');
            console.log('SELECT "User"."phone" SUCCESS');
        } catch (e) {
            console.error('SELECT "User"."phone" FAILED:', e.message);
        }

    } catch (err) {
        console.error('Connection FAILED:', err.message);
    } finally {
        await client.end();
    }
}

run();
