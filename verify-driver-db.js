const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'transport_db',
    password: 'postgres',
    port: 5432,
});

async function verify() {
    try {
        await client.connect();

        console.log('Checking for user...');
        const userRes = await client.query("SELECT * FROM users WHERE email = 'demo.driver.test@example.com'");
        if (userRes.rows.length === 0) {
            console.log('User NOT found.');
            return;
        }
        const user = userRes.rows[0];
        console.log('User found:', user.id, user.email, 'isActive:', user.is_active);

        console.log('Checking for driver...');
        const driverRes = await client.query("SELECT * FROM drivers WHERE user_id = $1", [user.id]);
        if (driverRes.rows.length === 0) {
            console.log('Driver profile NOT found.');
        } else {
            console.log('Driver profile found:', driverRes.rows[0].id);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

verify();
