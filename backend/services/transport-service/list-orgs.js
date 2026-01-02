const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function list() {
    await client.connect();
    const res = await client.query("SELECT * FROM organizations");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

list().catch(err => {
    console.error(err);
    process.exit(1);
});
