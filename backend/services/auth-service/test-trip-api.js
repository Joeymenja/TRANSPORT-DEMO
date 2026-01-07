const axios = require('axios');

const AUTH_SERVICE_URL = 'http://localhost:8081';
const TRANSPORT_SERVICE_URL = 'http://localhost:8082';

async function testTripAPI() {
    try {
        // Login as the driver
        console.log('Logging in as new.driver@gvbh.com...\n');
        const loginResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, {
            email: 'new.driver@gvbh.com',
            password: 'password123'
        });

        const { accessToken, user } = loginResponse.data;
        console.log('Login successful!');
        console.log('User:', JSON.stringify(user, null, 2));
        console.log('\nAccess Token:', accessToken.substring(0, 50) + '...\n');

        // Test different trip API endpoints
        console.log('Testing trip API endpoints...\n');

        // Try 1: GET /api/trips with organizationId
        try {
            console.log('1. GET /api/trips with organizationId...');
            const response1 = await axios.get(`${TRANSPORT_SERVICE_URL}/api/trips`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { organizationId: user.organizationId }
            });
            console.log(`   Success! Found ${response1.data.length} trips`);
            if (response1.data.length > 0) {
                console.log('   First trip:', JSON.stringify(response1.data[0], null, 2));
            }
        } catch (error) {
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

        // Try 2: GET /api/trips without params
        try {
            console.log('\n2. GET /api/trips (no params)...');
            const response2 = await axios.get(`${TRANSPORT_SERVICE_URL}/api/trips`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log(`   Success! Found ${response2.data.length} trips`);
        } catch (error) {
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

        // Try 3: GET /api/trips/driver/:driverId
        try {
            console.log('\n3. GET /api/trips/driver/:driverId...');
            const response3 = await axios.get(`${TRANSPORT_SERVICE_URL}/api/trips/driver/${user.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log(`   Success! Found ${response3.data.length} trips`);
        } catch (error) {
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

        // Try 4: GET /api/drivers/me to see driver info
        try {
            console.log('\n4. GET /api/drivers/me...');
            const response4 = await axios.get(`${TRANSPORT_SERVICE_URL}/api/drivers/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log('   Success! Driver info:', JSON.stringify(response4.data, null, 2));
        } catch (error) {
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

        // Try 5: GET /api/drivers to list all drivers
        try {
            console.log('\n5. GET /api/drivers...');
            const response5 = await axios.get(`${TRANSPORT_SERVICE_URL}/api/drivers`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { organizationId: user.organizationId }
            });
            console.log(`   Success! Found ${response5.data.length} drivers`);
            if (response5.data.length > 0) {
                console.log('   Drivers:', response5.data.map(d => ({
                    id: d.id,
                    name: `${d.user?.firstName} ${d.user?.lastName}`,
                    email: d.user?.email
                })));
            }
        } catch (error) {
            console.log(`   Error: ${error.response?.data?.message || error.message}`);
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testTripAPI();
