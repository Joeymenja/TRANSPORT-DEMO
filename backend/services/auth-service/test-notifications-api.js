const axios = require('axios');

async function testNotificationsAPI() {
    console.log('Testing Notifications API...\n');

    // 1. Login as admin first
    console.log('1. Logging in as admin...');
    try {
        const loginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });

        const token = loginResponse.data.accessToken;
        const user = loginResponse.data.user;

        console.log(`   ✓ Logged in as: ${user.email}`);
        console.log(`   Organization ID: ${user.organizationId}`);
        console.log(`   Token: ${token.substring(0, 50)}...\n`);

        // 2. Test GET /notifications/unread
        console.log('2. Testing GET /notifications/unread...');
        try {
            const unreadResponse = await axios.get('http://localhost:8082/notifications/unread', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   ✓ Success! Found ${unreadResponse.data.length} unread notifications`);
            if (unreadResponse.data.length > 0) {
                console.log('   First notification:', unreadResponse.data[0]);
            }
        } catch (error) {
            console.log(`   ✗ Error:`, error.response?.data || error.message);
        }

        // 3. Test GET /notifications (all)
        console.log('\n3. Testing GET /notifications (all)...');
        try {
            const allResponse = await axios.get('http://localhost:8082/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   ✓ Success! Found ${allResponse.data.length} total notifications`);
            if (allResponse.data.length > 0) {
                allResponse.data.forEach((notif, i) => {
                    console.log(`   ${i + 1}. [${notif.status}] ${notif.type}`);
                    console.log(`      Title: ${notif.title}`);
                    console.log(`      Message: ${notif.message.substring(0, 80)}...`);
                });
            }
        } catch (error) {
            console.log(`   ✗ Error:`, error.response?.data || error.message);
        }

        // 4. Test without auth (should fail)
        console.log('\n4. Testing without auth (should fail)...');
        try {
            await axios.get('http://localhost:8082/notifications/unread');
            console.log(`   ✗ Unexpected success!`);
        } catch (error) {
            console.log(`   ✓ Expected error: ${error.response?.status} ${error.response?.statusText}`);
        }

        // 5. Check trips API
        console.log('\n5. Testing GET /trips...');
        try {
            const tripsResponse = await axios.get('http://localhost:8082/api/trips', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    organizationId: user.organizationId
                }
            });
            console.log(`   ✓ Success! Found ${tripsResponse.data.length} trips`);
            if (tripsResponse.data.length > 0) {
                console.log('   First trip:', {
                    id: tripsResponse.data[0].id.substring(0, 8) + '...',
                    date: tripsResponse.data[0].tripDate,
                    status: tripsResponse.data[0].status,
                    reportStatus: tripsResponse.data[0].reportStatus
                });
            }
        } catch (error) {
            console.log(`   ✗ Error:`, error.response?.data || error.message);
        }

    } catch (loginError) {
        console.log(`   ✗ Login failed:`, loginError.response?.data || loginError.message);
        console.log('\n   Available admin accounts to try:');
        console.log('   - admin@gvbh.com / password123');
        console.log('   - Try checking what admins exist in the database');
    }
}

testNotificationsAPI();
