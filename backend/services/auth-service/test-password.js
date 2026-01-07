const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'transport_demo',
    });

    try {
        await client.connect();
        console.log('Connected to database.\n');

        // Get admin user
        const result = await client.query(
            `SELECT id, email, password_hash, role, is_active
             FROM users
             WHERE email = $1`,
            ['admin@gvbh.com']
        );

        if (result.rows.length === 0) {
            console.log('❌ User not found: admin@gvbh.com');
            return;
        }

        const user = result.rows[0];
        console.log('User found:');
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.is_active}`);
        console.log(`  Hash: ${user.password_hash.substring(0, 20)}...`);
        console.log();

        // Test passwords
        const testPasswords = [
            'password123',
            'Password123',
            'admin123',
            'Admin123',
            'admin',
            'password',
        ];

        console.log('Testing passwords:');
        for (const testPass of testPasswords) {
            const isMatch = await bcrypt.compare(testPass, user.password_hash);
            console.log(`  ${testPass}: ${isMatch ? '✅ MATCH' : '❌ no match'}`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

testLogin();
