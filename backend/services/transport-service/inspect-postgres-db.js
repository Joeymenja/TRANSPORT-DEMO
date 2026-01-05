const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users';
        `);
        console.log('Tables in postgres DB matching users:', res.rowCount);
        if (res.rowCount > 0) {
            const cols = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users';
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
