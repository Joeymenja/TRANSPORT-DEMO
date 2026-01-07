const axios = require('axios');

async function checkTrips() {
    const loginResponse = await axios.post('http://localhost:8081/auth/login', {
        email: 'admin@gvbh.com',
        password: 'password123'
    });
    const token = loginResponse.data.accessToken;

    const tripsResponse = await axios.get('http://localhost:3003/trips', {
        headers: { Authorization: `Bearer ${token}` },
        params: { organizationId: loginResponse.data.user.organizationId }
    });

    console.log('First trip structure:');
    console.log(JSON.stringify(tripsResponse.data[0], null, 2));
}

checkTrips().catch(console.error);
