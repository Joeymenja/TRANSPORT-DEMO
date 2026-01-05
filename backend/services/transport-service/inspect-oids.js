const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to gvbh_transport');

        const res = await client.query(`
            SELECT oid, relname, relnamespace, relkind
            FROM pg_class 
            WHERE relname = 'users';
        `);
        console.table(res.rows);

        const nsres = await client.query(`
            SELECT oid, nspname FROM pg_namespace;
        `);
        console.table(nsres.rows);

        // Check columns for each OID
        for (const row of res.rows) {
            console.log(`Columns for table OID ${row.oid} (namespace ${row.relnamespace}):`);
            const cols = await client.query(`
                SELECT attname, atttypid::regtype 
                FROM pg_attribute 
                WHERE attrelid = ${row.oid} AND attnum > 0 AND NOT attisdropped;
            `);
            console.table(cols.rows);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
