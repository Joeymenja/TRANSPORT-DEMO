const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function truncateMembers() {
    try {
        await client.connect();

        // Cascade to clear referencing tables (trip_members)
        await client.query('TRUNCATE TABLE members CASCADE');

        console.log('Truncated members table.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

truncateMembers();
