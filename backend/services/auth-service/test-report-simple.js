const axios = require('axios');

async function testReportNotification() {
    console.log('Testing Trip Report Notification (Simple)...\\n');

    try {
        // 1. Login as admin
        console.log('1. Logging in as admin...');
        const adminLoginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const adminToken = adminLoginResponse.data.accessToken;
        const orgId = adminLoginResponse.data.user.organizationId;
        console.log(`   ✓ Logged in\\n`);

        // 2. Get existing trips
        console.log('2. Getting existing trips...');
        const tripsResponse = await axios.get('http://localhost:3003/trips', {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { organizationId: orgId }
        });
        console.log(`   Found ${tripsResponse.data.length} trips`);

        if (tripsResponse.data.length === 0) {
            console.log('   ❌ No trips found');
            return;
        }

        const trip = tripsResponse.data[0];
        console.log(`   Using trip: ${trip.id}\\n`);

        // 3. Get current notification count
        console.log('3. Checking notifications before report...');
        const beforeNotifs = await axios.get('http://localhost:3003/notifications', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const beforeCount = beforeNotifs.data.filter(n => n.type === 'TRIP_REPORT_SUBMITTED').length;
        console.log(`   TRIP_REPORT_SUBMITTED notifications: ${beforeCount}\\n`);

        // 4. Create and submit a new report using the combined endpoint
        console.log('4. Creating and submitting new trip report...');

        const submitResponse = await axios.post(`http://localhost:3003/reports/trip/${trip.id}/submit`, {
            driverId: trip.assignedDriverId || 'test-driver-id',
            startOdometer: 12000,
            endOdometer: 12050,
            pickupTime: new Date(),
            dropoffTime: new Date(),
            notes: 'Test notification report',
            serviceVerified: true,
            clientArrived: true,
            incidentReported: false
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const reportId = submitResponse.data.id;
        console.log(`   ✓ Report submitted: ${reportId.substring(0, 8)}...\\n`);

        // 5. Check for notification
        console.log('5. Checking for new notification...');
        await new Promise(resolve => setTimeout(resolve, 500));

        const afterNotifs = await axios.get('http://localhost:3003/notifications', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const afterCount = afterNotifs.data.filter(n => n.type === 'TRIP_REPORT_SUBMITTED').length;
        console.log(`   TRIP_REPORT_SUBMITTED notifications: ${afterCount}`);

        if (afterCount > beforeCount) {
            const newNotif = afterNotifs.data.find(n =>
                n.type === 'TRIP_REPORT_SUBMITTED' &&
                n.metadata?.tripReportId === reportId
            );
            if (newNotif) {
                console.log(`   ✓ New notification found!`);
                console.log(`     Title: ${newNotif.title}`);
                console.log(`     Message: ${newNotif.message}`);
                console.log(`     Status: ${newNotif.status}`);
                console.log(`\\n✅ Trip report notification is WORKING!`);
            }
        } else {
            console.log(`   ❌ No new notification created`);
        }

    } catch (error) {
        console.error(`   ✗ Error:`, error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`   HTTP Status: ${error.response.status}`);
        }
    }
}

testReportNotification();
