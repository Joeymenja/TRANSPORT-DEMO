const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres', // Connect to default database first
});

async function setupDatabase() {
    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        console.log('✓ Connected to PostgreSQL');

        // Check if database exists
        const checkDb = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = 'gvbh_transport'"
        );

        if (checkDb.rows.length === 0) {
            console.log('Creating database gvbh_transport...');
            await client.query('CREATE DATABASE gvbh_transport');
            console.log('✓ Database created');
        } else {
            console.log('✓ Database gvbh_transport already exists');
        }

        await client.end();
        console.log('✓ Setup complete');
    } catch (err) {
        console.error('✗ Error:', err.message);
        process.exit(1);
    }
}

setupDatabase();
