const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
        
        // Query a vehicle to assign as default for the driver
        const vehicleRes = await client.query('SELECT id FROM vehicles LIMIT 1');
        if (vehicleRes.rows.length === 0) {
            console.error('No vehicles found to assign');
            return;
        }
        const vehicleId = vehicleRes.rows[0].id;
        console.log('Assigning vehicle', vehicleId, 'to new.driver@gvbh.com');

        await client.query(`
            UPDATE users 
            SET default_vehicle_id = $1 
            WHERE email = 'new.driver@gvbh.com'
        `, [vehicleId]);
        console.log('Assigning vehicle', vehicleId, 'to new.driver@gvbh.com');
        
        await client.query(`
            UPDATE users 
            SET default_vehicle_id = $1 
            WHERE email = 'new.driver@gvbh.com'
        `, [vehicleId]);
        
        console.log('Vehicle assigned successfully.');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
