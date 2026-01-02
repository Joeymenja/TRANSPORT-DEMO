const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function inspect() {
    await client.connect();
    const res = await client.query(`
    SELECT column_name, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'trips'
  `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

inspect().catch(console.error);
