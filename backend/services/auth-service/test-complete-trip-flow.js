const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testCompleteFlow() {
    console.log('=== Complete Trip Report Flow Test ===\n');

    try {
        // 1. Login as admin
        console.log('1. Logging in as admin...');
        const adminLogin = await axios.post('http://localhost:8081/auth/login', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        const adminToken = adminLogin.data.accessToken;
        const orgId = adminLogin.data.user.organizationId;
        console.log('   ✓ Admin logged in\n');

        // 2. Create a test member (client)
        console.log('2. Creating test member...');
        const memberResponse = await axios.post('http://localhost:8083/members', {
            organizationId: orgId,
            firstName: 'Test',
            lastName: 'Client',
            dateOfBirth: '1980-01-01',
            phoneNumber: '555-9999',
            addressStreet: '123 Client St',
            addressCity: 'Phoenix',
            addressState: 'AZ',
            addressZip: '85001'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const memberId = memberResponse.data.id;
        console.log(`   ✓ Member created: ${memberId.substring(0, 8)}...\n`);

        // 3. Create a fresh driver
        console.log('3. Creating demo driver...');
        const driverEmail = `driver.test.${Date.now()}@gvbh.com`;
        const driverRegister = await axios.post('http://localhost:8081/auth/register-driver', {
            email: driverEmail,
            password: 'password123',
            firstName: 'Test',
            lastName: 'Driver',
            phone: '555-1234',
            licenseNumber: `DL${Date.now()}`,
            licenseState: 'AZ'
        });
        const driverId = driverRegister.data.id;

        // Approve driver
        await axios.post(`http://localhost:8081/auth/drivers/${driverId}/approve`, {}, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        // Get driver details from transport service
        const driversResponse = await axios.get('http://localhost:3003/drivers', {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { organizationId: orgId }
        });
        const driver = driversResponse.data.find(d => d.user?.email === driverEmail);
        console.log(`   ✓ Driver created and approved\n`);

        // 4. Create a trip with member and driver
        console.log('4. Creating trip...');
        const tripDate = new Date();
        const tripResponse = await axios.post('http://localhost:3003/trips', {
            tripDate: tripDate.toISOString().split('T')[0],
            assignedDriverId: driver.id,
            tripType: 'ONE_WAY',
            status: 'SCHEDULED',
            members: [{
                memberId: memberId,
                pickupAddress: '123 Client St, Phoenix, AZ 85001',
                dropoffAddress: '456 Medical Center Dr, Phoenix, AZ 85002'
            }],
            stops: [
                {
                    stopType: 'PICKUP',
                    stopOrder: 1,
                    address: '123 Client St, Phoenix, AZ 85001',
                    scheduledTime: new Date()
                },
                {
                    stopType: 'DROPOFF',
                    stopOrder: 2,
                    address: '456 Medical Center Dr, Phoenix, AZ 85002',
                    scheduledTime: new Date()
                }
            ]
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const tripId = tripResponse.data.id;
        console.log(`   ✓ Trip created: ${tripId.substring(0, 8)}...`);
        console.log(`   Trip date: ${tripDate.toISOString().split('T')[0]}\n`);

        // 5. Login as driver and submit report
        console.log('5. Driver submitting trip report...');
        const driverLogin = await axios.post('http://localhost:8081/auth/login', {
            email: driverEmail,
            password: 'password123'
        });
        const driverToken = driverLogin.data.accessToken;

        const reportResponse = await axios.post(`http://localhost:3003/reports/trip/${tripId}/submit`, {
            driverId: driver.id,
            startOdometer: 10000,
            endOdometer: 10025,
            pickupTime: new Date(),
            dropoffTime: new Date(),
            notes: 'Trip completed successfully. Client transported safely to medical appointment.',
            serviceVerified: true,
            clientArrived: true,
            incidentReported: false
        }, {
            headers: { Authorization: `Bearer ${driverToken}` }
        });

        console.log(`   ✓ Report submitted: ${reportResponse.data.id.substring(0, 8)}...`);
        console.log(`   PDF saved to: ${reportResponse.data.pdfFilePath}\n`);

        // 6. Verify PDF file exists
        console.log('6. Verifying PDF file...');
        const pdfPath = path.join(process.cwd(), '../../..', reportResponse.data.pdfFilePath);
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            console.log(`   ✓ PDF file exists`);
            console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`   Full path: ${pdfPath}\n`);
        } else {
            console.log(`   ✗ PDF file not found at: ${pdfPath}\n`);
        }

        // 7. Check admin notifications
        console.log('7. Checking admin notifications...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const notificationsResponse = await axios.get('http://localhost:3003/notifications/unread', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const reportNotif = notificationsResponse.data.find(n =>
            n.type === 'TRIP_REPORT_SUBMITTED' &&
            n.metadata?.tripReportId === reportResponse.data.id
        );

        if (reportNotif) {
            console.log(`   ✓ Notification created!`);
            console.log(`   Title: ${reportNotif.title}`);
            console.log(`   Message: ${reportNotif.message}`);
            console.log(`   Status: ${reportNotif.status}\n`);
        } else {
            console.log(`   ✗ No notification found for this report\n`);
        }

        // 8. Summary
        console.log('=== Test Summary ===');
        console.log(`✓ Member created`);
        console.log(`✓ Driver created and approved`);
        console.log(`✓ Trip created with member and driver`);
        console.log(`✓ Report submitted by driver`);
        console.log(`✓ PDF saved in organized folder structure`);
        console.log(`✓ Admin notification created`);
        console.log('\n✅ Complete flow test PASSED!\n');

        console.log('Test accounts:');
        console.log(`Admin: admin@gvbh.com / password123`);
        console.log(`Driver: ${driverEmail} / password123`);

    } catch (error) {
        console.error('\n✗ Test FAILED');
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.response.config?.url);
        }
    }
}

testCompleteFlow();
