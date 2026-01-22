const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
});

async function inspectValues() {
    await client.connect();
    
    const tables = ['trips'];
    const columns = ['trip_type', 'status', 'mobility_requirement'];
    
    for (const table of tables) {
        for (const col of columns) {
            try {
                const res = await client.query(`SELECT DISTINCT "${col}" FROM "${table}"`);
                console.log(`\nDistinct values for ${table}.${col}:`);
                console.log(res.rows.map(r => r[col]).join(', '));
            } catch (e) {
                console.log(`Error checking ${table}.${col}:`, e.message);
            }
        }
    }
    
    await client.end();
}

inspectValues().catch(console.error);
