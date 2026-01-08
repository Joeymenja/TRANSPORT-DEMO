
const { Client } = require('pg');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function checkUser() {
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        const res = await client.query("SELECT id, email, role, is_active FROM users WHERE email = 'new.driver@gvbh.com'");
        if (res.rows.length > 0) {
            console.log('User found:', res.rows[0]);
        } else {
            console.log('User NOT found: new.driver@gvbh.com');
            
            // List all users to see what's there
            const all = await client.query("SELECT email, role FROM users");
            console.log('Existing users:', all.rows);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();
