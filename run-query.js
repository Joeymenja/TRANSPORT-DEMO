const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

const query = process.argv[2];

if (!query) {
    console.error('Please provide a query as the first argument');
    process.exit(1);
}

(async () => {
    try {
        await client.connect();
        const res = await client.query(query);
        console.table(res.rows);
    } catch (err) {
        console.error('Query error:', err);
    } finally {
        await client.end();
    }
})();
