import { Client } from 'pg';

async function checkSchema() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'gvbh_transport',
    });
    await client.connect();
    try {
        console.log('Checking User Schema...');
        const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('User columns:', cols.rows.map(r => r.column_name).join(', '));

        console.log('Checking Trip Status Enum...');
        try {
            const enums = await client.query("SELECT enum_range(NULL::trip_status_enum)");
            console.log('TripStatus Enum values:', enums.rows[0].enum_range);
        } catch (e) {
            console.log('Error checking enum:', e.message);
        }

    } catch (e) {
        console.log('Schema Check Error:', e.message);
    } finally {
        await client.end();
    }
}

checkSchema();
