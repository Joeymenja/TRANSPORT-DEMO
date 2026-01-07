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
        
        console.log('--- Checking Members Table Schema ---');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'members'
            ORDER BY column_name;
        `);
        
        if (res.rows.length === 0) {
            console.log('Table "members" NOT FOUND');
        } else {
            console.log('Columns found:', res.rows.map(r => r.column_name).join(', '));
            const hasMobility = res.rows.some(r => r.column_name === 'mobility_requirement');
            console.log('Has mobility_requirement:', hasMobility);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
