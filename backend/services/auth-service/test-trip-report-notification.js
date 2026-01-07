const axios = require('axios');

async function testTripReportNotification() {
    console.log('Testing Trip Report Notification...\\n');

    try {
        // 1. Login as admin to get organization and trips
        console.log('1. Logging in as admin...');
        const adminLoginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const adminToken = adminLoginResponse.data.accessToken;
        const orgId = adminLoginResponse.data.user.organizationId;
        console.log(`   ✓ Logged in as admin`);
        console.log(`   Organization ID: ${orgId}\\n`);

        // 2. Create a test trip
        console.log('2. Creating test trip...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newTripResponse = await axios.post('http://localhost:3003/trips', {
            organizationId: orgId,
            tripDate: tomorrow.toISOString().split('T')[0],
            pickupTime: '09:00',
            appointmentTime: '10:00',
            pickupLocation: '123 Test St',
            dropoffLocation: '456 Dest Ave',
            purpose: 'Medical Appointment',
            tripType: 'ONE_WAY',
            status: 'SCHEDULED'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const testTrip = newTripResponse.data;
        console.log(`   ✓ Created test trip: ${testTrip.id.substring(0, 8)}...`);
        console.log(`   Trip Date: ${testTrip.tripDate}\\n`);

        // 3. Check current notifications count
        console.log('3. Checking current notifications...');
        const beforeNotifs = await axios.get('http://localhost:3003/notifications/unread', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   Current unread notifications: ${beforeNotifs.data.length}\\n`);

        // 4. Submit a trip report (simulating driver submission)
        console.log('4. Submitting trip report...');
        const reportData = {
            tripId: testTrip.id,
            startOdometer: 10000,
            endOdometer: 10050,
            pickupTime: new Date().toISOString(),
            dropoffTime: new Date().toISOString(),
            notes: 'Test trip report submission',
            serviceVerified: true,
            clientArrived: true,
            incidentReported: false
        };

        const reportResponse = await axios.post('http://localhost:3003/reports/submit', reportData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`   ✓ Trip report submitted`);
        console.log(`   Report ID: ${reportResponse.data.id}\\n`);

        // 5. Check for new notification
        console.log('5. Checking for new trip report notification...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay

        const afterNotifs = await axios.get('http://localhost:3003/notifications/unread', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log(`   Unread notifications after submission: ${afterNotifs.data.length}`);

        const tripReportNotif = afterNotifs.data.find(n => n.type === 'TRIP_REPORT_SUBMITTED');
        if (tripReportNotif) {
            console.log(`   ✓ TRIP_REPORT_SUBMITTED notification found!`);
            console.log(`     Title: ${tripReportNotif.title}`);
            console.log(`     Message: ${tripReportNotif.message}`);
            console.log(`     \\n✅ Trip report notification is WORKING!`);
        } else {
            console.log(`   ✗ No TRIP_REPORT_SUBMITTED notification found`);
            console.log(`   ❌ Trip report submission did NOT create notification`);
        }

    } catch (error) {
        console.error(`   ✗ Error:`, error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`   HTTP Status: ${error.response.status}`);
        }
    }
}

testTripReportNotification();
