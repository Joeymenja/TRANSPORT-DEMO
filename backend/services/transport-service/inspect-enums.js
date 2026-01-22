const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function inspectEnums() {
    await client.connect();
    
    const enums = ['trips_status_enum', 'trips_trip_type_enum', 'trips_mobility_requirement_enum'];
    
    for (const enumName of enums) {
        const res = await client.query(`SELECT unnest(enum_range(NULL::${enumName}))`);
        console.log(`\nValues for ${enumName}:`);
        console.log(res.rows.map(r => r.unnest).join(', '));
    }
    
    await client.end();
}

inspectEnums().catch(console.error);
