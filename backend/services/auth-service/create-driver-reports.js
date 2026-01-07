const axios = require('axios');

async function createDriverReports() {
    console.log('Creating Demo Trip Reports from Driver Account...\n');

    try {
        // 1. Get list of drivers
        console.log('1. Checking for available drivers...');
        const adminLoginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const adminToken = adminLoginResponse.data.accessToken;
        const orgId = adminLoginResponse.data.user.organizationId;

        // Get all drivers
        const driversResponse = await axios.get('http://localhost:3003/drivers', {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { organizationId: orgId }
        });

        console.log(`   Found ${driversResponse.data.length} drivers`);

        // Always create a fresh driver account for testing
        console.log('   Creating a fresh demo driver account...');

        const driverEmail = `driver.demo.${Date.now()}@gvbh.com`;

        // Register a test driver
        const registerResponse = await axios.post('http://localhost:8081/auth/register-driver', {
            email: driverEmail,
            password: 'password123',
            firstName: 'Demo',
            lastName: 'Driver',
            phone: '555-1234',
            licenseNumber: `DL${Date.now()}`,
            licenseState: 'AZ'
        });
        console.log('   ✓ Created demo driver account');

        // Approve the driver
        const userId = registerResponse.data.id;
        await axios.post(`http://localhost:8081/auth/drivers/${userId}/approve`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   ✓ Approved driver');

        // Get the driver ID
        const driversResponse2 = await axios.get('http://localhost:3003/drivers', {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { organizationId: orgId }
        });
        var testDriver = driversResponse2.data.find(d => d.user?.email === driverEmail);

        console.log(`   Using driver: ${testDriver.user.firstName} ${testDriver.user.lastName}`);
        console.log(`   Email: ${testDriver.user.email}\n`);

        // 2. Login as the driver
        console.log('2. Logging in as driver...');
        const driverLoginResponse = await axios.post('http://localhost:8081/auth/login', {
            email: testDriver.user.email,
            password: 'password123'
        });
        const driverToken = driverLoginResponse.data.accessToken;
        console.log('   ✓ Logged in as driver\n');

        // 3. Get trips assigned to this driver
        console.log('3. Getting trips assigned to driver...');
        const tripsResponse = await axios.get('http://localhost:3003/trips', {
            headers: { Authorization: `Bearer ${driverToken}` },
            params: { organizationId: orgId, assignedDriverId: testDriver.id }
        });

        console.log(`   Found ${tripsResponse.data.length} assigned trips`);

        if (tripsResponse.data.length === 0) {
            console.log('   No trips assigned to this driver');
            console.log('   You can assign trips to this driver from the admin portal\n');
            return;
        }

        // 4. Submit reports for trips that don't have reports yet
        console.log('\n4. Submitting trip reports...');
        let reportsSubmitted = 0;

        for (const trip of tripsResponse.data.slice(0, 3)) { // Limit to first 3 trips
            try {
                // Check if trip already has a report
                const existingReport = await axios.get(`http://localhost:3003/reports/${trip.id}`, {
                    headers: { Authorization: `Bearer ${driverToken}` }
                }).catch(() => null);

                if (existingReport?.data && existingReport.data.status === 'SUBMITTED') {
                    console.log(`   - Trip ${trip.id.substring(0, 8)}... already has submitted report (skipping)`);
                    continue;
                }

                // Submit a new report
                const reportData = {
                    driverId: testDriver.id,
                    startOdometer: 10000 + Math.floor(Math.random() * 1000),
                    endOdometer: 10050 + Math.floor(Math.random() * 1000),
                    pickupTime: new Date(trip.tripDate).toISOString(),
                    dropoffTime: new Date(trip.tripDate).toISOString(),
                    notes: `Trip completed successfully. All passengers transported safely.`,
                    serviceVerified: true,
                    clientArrived: true,
                    incidentReported: false
                };

                const reportResponse = await axios.post(
                    `http://localhost:3003/reports/trip/${trip.id}/submit`,
                    reportData,
                    { headers: { Authorization: `Bearer ${driverToken}` } }
                );

                console.log(`   ✓ Submitted report for trip ${trip.id.substring(0, 8)}... (${trip.tripDate})`);
                reportsSubmitted++;

            } catch (error) {
                console.log(`   ✗ Failed to submit report for trip ${trip.id.substring(0, 8)}...`);
                console.log(`     Error: ${error.response?.data?.message || error.message}`);
            }
        }

        console.log(`\n   Total reports submitted: ${reportsSubmitted}\n`);

        // 5. Check admin notifications
        console.log('5. Checking admin notifications...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for notifications

        const notificationsResponse = await axios.get('http://localhost:3003/notifications/unread', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const reportNotifs = notificationsResponse.data.filter(n => n.type === 'TRIP_REPORT_SUBMITTED');
        console.log(`   Admin has ${reportNotifs.length} unread trip report notifications`);

        if (reportNotifs.length > 0) {
            console.log('\n   Recent notifications:');
            reportNotifs.slice(0, 3).forEach((notif, i) => {
                console.log(`   ${i + 1}. ${notif.title}`);
                console.log(`      ${notif.message}`);
                console.log(`      Created: ${new Date(notif.createdAt).toLocaleString()}`);
            });
        }

        console.log('\n✅ Demo reports created successfully!');
        console.log(`\nDriver account: ${testDriver.user.email} / password123`);

    } catch (error) {
        console.error('✗ Error:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error(`HTTP Status: ${error.response.status}`);
        }
    }
}

createDriverReports();
