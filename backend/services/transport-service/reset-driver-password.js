
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function resetPassword() {
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        const email = 'new.driver@gvbh.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log(`Resetting password for ${email}...`);
        
        const res = await client.query(
            "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id",
            [hashedPassword, email]
        );
        
        if (res.rows.length > 0) {
            console.log(`Password updated successfully for user ID: ${res.rows[0].id}`);
        } else {
            console.log('User not found during update.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

resetPassword();
