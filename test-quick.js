const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const AUTH_API = 'http://localhost:3001/api';

async function quickTest() {
    try {
        console.log('Testing login...');
        const loginResponse = await axios.post(`${AUTH_API}/auth/login`, {
            email: 'admin@gvbh.com',
            password: 'password123'
        });

        console.log('✅ Login successful');
        console.log('Token:', loginResponse.data.token ? loginResponse.data.token.substring(0, 20) + '...' : 'N/A');
        console.log('User:', loginResponse.data.user.email);
        console.log('Org ID:', loginResponse.data.user.organizationId ? loginResponse.data.user.organizationId.substring(0, 8) : 'N/A');

        const token = loginResponse.data.token;
        const orgId = loginResponse.data.user.organizationId;
        const userId = loginResponse.data.user.id;

        console.log('\nTesting trip fetch...');
        const tripsResponse = await axios.get(`${API_BASE}/trips`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Organization-ID': orgId
            },
            params: {
                date: new Date().toISOString().split('T')[0]
            }
        });

        console.log('✅ Trips fetched successfully');
        console.log('Trip count:', tripsResponse.data.length);

        if (tripsResponse.data.length > 0) {
            console.log('Sample trip:', {
                id: tripsResponse.data[0].id.substring(0, 8),
                status: tripsResponse.data[0].status,
                mobilityRequirement: tripsResponse.data[0].mobilityRequirement
            });
        }

        console.log('\n✅ All quick tests passed!');

    } catch (err) {
        console.error('❌ Test failed:', err.response?.data || err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

quickTest();
