const { Client } = require('pg');
const bcrypt = require('bcryptjs');

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
        
        const email = 'alexander.gichungu@gvbh.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await client.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = $2
            RETURNING id
        `, [hashedPassword, email]);

        if (res.rows.length > 0) {
            console.log(`Password reset successfully for ${email}`);
        } else {
            console.log(`User ${email} not found`);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
