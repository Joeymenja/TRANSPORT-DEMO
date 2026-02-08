const { Client } = require('pg');

const dbConfig = { 
    host: 'localhost', 
    database: 'gvbh_transport', 
    user: 'postgres', 
    password: 'postgres', 
    port: 5432 
};

async function fixDriver() {
    console.log('--- FIXING DRIVER DATA ---');
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        // 1. Ensure all users are active
        await client.query("UPDATE users SET is_active = true");
        console.log("Updated all users to active.");

        // 2. Ensure all drivers are active
        await client.query("UPDATE drivers SET is_active = true");
        console.log("Updated all drivers to active.");

    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
}
fixDriver();
