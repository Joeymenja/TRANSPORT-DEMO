const axios = require('axios');

async function testDriverAdminSync() {
    console.log('Testing Driver-Admin Synchronization...\\n');

    try {
        // 1. Register a new driver
        console.log('1. Registering new driver...');
        const registerResponse = await axios.post('http://localhost:8081/auth/register-driver', {
            email: `testdriver${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'Driver',
            phone: '555-0123',
            licenseNumber: `DL${Date.now()}`,
            licenseState: 'CA'
        });

        console.log(`   ✓ Driver registered successfully`);
        console.log(`   Response:`, JSON.stringify(registerResponse.data, null, 2));
        console.log('');

        // 2. Login as admin
        console.log('2. Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const token = loginResponse.data.accessToken;
        console.log(`   ✓ Logged in as admin\\n`);

        // 3. Check for notifications
        console.log('3. Checking for driver pending notification...');
        const notificationResponse = await axios.get('http://localhost:3003/notifications/unread', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   Found ${notificationResponse.data.length} unread notifications`);

        if (notificationResponse.data.length > 0) {
            const driverNotif = notificationResponse.data.find(n => n.type === 'DRIVER_PENDING');
            if (driverNotif) {
                console.log(`   ✓ DRIVER_PENDING notification found!`);
                console.log(`     Title: ${driverNotif.title}`);
                console.log(`     Message: ${driverNotif.message}`);
                console.log(`     \\n✅ Driver-Admin synchronization is WORKING!`);
            } else {
                console.log(`   ✗ No DRIVER_PENDING notification found`);
                console.log(`   ❌ Driver registration did NOT create notification`);
            }
        } else {
            console.log(`   ❌ No notifications created`);
            console.log(`   Expected: Notification when driver registers with PENDING status`);
        }

    } catch (error) {
        console.error(`   ✗ Error:`, error.response?.data || error.message);
    }
}

testDriverAdminSync();
