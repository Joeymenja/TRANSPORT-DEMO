const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

const SECRET = 'a346b2dffa16991d70c77ce17dc6d9a25167a500f8e489e75a58e93de2a811fe';

async function testAuth() {
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get Admin User
        const res = await client.query("SELECT * FROM users WHERE email = 'admin@gvbh-demo.com'");
        if (res.rows.length === 0) {
            console.error('Admin user not found in DB');
            return;
        }
        const user = res.rows[0];
        console.log('User found:', user.email, user.id);
        console.log('Org ID:', user.organization_id);

        // 2. Generate Token
        // Matches AuthService payload structure
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role, // e.g. 'ORG_ADMIN'
            organizationId: user.organization_id
        };

        const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
        console.log('Generated Token:', token);

        // 3. Test API on Transport Service (8082)
        try {
            console.log('Testing /notifications/unread on port 8082...');
            const response = await axios.get('http://localhost:8082/notifications/unread', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Success! Status:', response.status);
            console.log('Data:', response.data);
        } catch (error) {
            console.error('Request Failed:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }

    } catch (err) {
        console.error('Script Error:', err);
        if (err.code) console.error('Error Code:', err.code);
        if (err.cause) console.error('Error Cause:', err.cause);
    } finally {
        await client.end();
    }
}

testAuth();
