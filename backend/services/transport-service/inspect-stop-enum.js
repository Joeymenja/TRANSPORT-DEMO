const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function inspectEnum() {
    await client.connect();
    
    const enumName = 'trip_stops_stop_type_enum';
    
    try {
        const res = await client.query(`SELECT unnest(enum_range(NULL::${enumName}))`);
        console.log(`\nValues for ${enumName}:`);
        console.log(res.rows.map(r => r.unnest).join(', '));
    } catch (e) {
        console.error(e.message);
    }
    
    await client.end();
}

inspectEnum().catch(console.error);
