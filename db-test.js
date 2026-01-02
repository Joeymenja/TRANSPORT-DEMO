const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

console.log('Attempting to connect to PostgreSQL...');

client.connect()
    .then(() => {
        console.log('✓ Successfully connected to PostgreSQL');
        return client.query('SELECT current_database(), now()');
    })
    .then(res => {
        console.log('Query result:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('✗ Connection error:', err.stack);
        process.exit(1);
    });
