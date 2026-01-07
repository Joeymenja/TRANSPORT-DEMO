const axios = require('axios');

async function run() {
    try {
        console.log('--- Testing Member Creation ---');
        
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;
        const orgId = 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00'; // Demo Org
        
        console.log('Token obtained.');

        // 2. Create Member
        const payload = {
            firstName: "Test",
            lastName: "Member" + Date.now(),
            dateOfBirth: "1980-01-01",
            memberId: "AHCCCS-" + Date.now(),
            mobilityRequirement: "AMBULATORY",
            phone: "555-1234",
            address: "123 Test St",
            isActive: true 
        };
        
        console.log('Sending payload:', payload);

        const res = await axios.post('http://localhost:8083/members', payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-organization-id': orgId
            }
        });
        
        console.log('Member created successfully:', res.data.id);
        
    } catch (err) {
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

run();
