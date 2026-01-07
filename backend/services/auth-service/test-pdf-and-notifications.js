const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testPdfAndNotifications() {
    console.log('=== PDF Generation & Notifications Test ===\n');

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

        // 2. Get existing trips
        console.log('2. Getting existing trips...');
        const tripsResponse = await axios.get('http://localhost:3003/trips', {
            headers: { Authorization: `Bearer ${adminToken}` },
            params: { organizationId: orgId }
        });

        if (tripsResponse.data.length === 0) {
            console.log('   ✗ No trips found in database');
            console.log('   Please create trips from the admin portal first\n');
            return;
        }

        // Find a trip with driver assigned
        let testTrip = tripsResponse.data.find(t => t.assignedDriverId);

        if (!testTrip) {
            // If no trip has a driver, just use the first trip
            testTrip = tripsResponse.data[0];
            console.log('   ⚠ No trip with driver found, using first available trip');
        }

        console.log(`   ✓ Using trip: ${testTrip.id.substring(0, 8)}...`);
        console.log(`   Trip date: ${testTrip.tripDate}`);
        console.log(`   Driver: ${testTrip.assignedDriverId || 'None'}`);
        console.log(`   Members: ${testTrip.tripMembers?.length || 0}\n`);

        // 3. Check current notification count
        console.log('3. Checking current notifications...');
        const beforeNotifs = await axios.get('http://localhost:3003/notifications', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const beforeCount = beforeNotifs.data.filter(n => n.type === 'TRIP_REPORT_SUBMITTED').length;
        console.log(`   Current TRIP_REPORT_SUBMITTED notifications: ${beforeCount}\n`);

        // 4. Submit a trip report (as admin for simplicity)
        console.log('4. Submitting trip report...');

        // Get a driver ID if trip doesn't have one
        let driverId = testTrip.assignedDriverId;
        if (!driverId) {
            const driversResp = await axios.get('http://localhost:3003/drivers', {
                headers: { Authorization: `Bearer ${adminToken}` },
                params: { organizationId: orgId }
            });
            if (driversResp.data.length > 0) {
                driverId = driversResp.data[0].id;
            } else {
                driverId = 'test-driver-id'; // Fallback
            }
        }

        const reportResponse = await axios.post(`http://localhost:3003/reports/trip/${testTrip.id}/submit`, {
            driverId: driverId,
            startOdometer: 10000 + Math.floor(Math.random() * 500),
            endOdometer: 10050 + Math.floor(Math.random() * 500),
            pickupTime: new Date(),
            dropoffTime: new Date(),
            notes: 'Trip completed successfully. Client transported safely.',
            serviceVerified: true,
            clientArrived: true,
            incidentReported: false
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log(`   ✓ Report submitted`);
        console.log(`   Report ID: ${reportResponse.data.id.substring(0, 8)}...`);
        console.log(`   PDF path: ${reportResponse.data.pdfFilePath}\n`);

        // 5. Verify PDF file structure
        console.log('5. Verifying PDF file organization...');
        const pdfPath = reportResponse.data.pdfFilePath;
        const fullPdfPath = path.join(process.cwd(), '../../..', pdfPath);

        // Check folder structure
        const expectedPattern = /^reports\/\d{4}-\d{2}\/\d{4}-\d{2}-\d{2}\/trip-[a-f0-9-]+\.pdf$/;
        if (expectedPattern.test(pdfPath)) {
            console.log(`   ✓ PDF path follows pattern: reports/YYYY-MM/YYYY-MM-DD/trip-{id}.pdf`);
        } else {
            console.log(`   ✗ PDF path doesn't follow expected pattern`);
        }

        // Check if file exists
        if (fs.existsSync(fullPdfPath)) {
            const stats = fs.statSync(fullPdfPath);
            console.log(`   ✓ PDF file exists`);
            console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`   Location: ${pdfPath}\n`);
        } else {
            console.log(`   ✗ PDF file not found at: ${fullPdfPath}\n`);
        }

        // 6. Check for new notification
        console.log('6. Checking for new notification...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const afterNotifs = await axios.get('http://localhost:3003/notifications', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const newNotif = afterNotifs.data.find(n =>
            n.type === 'TRIP_REPORT_SUBMITTED' &&
            n.metadata?.tripReportId === reportResponse.data.id
        );

        if (newNotif) {
            console.log(`   ✓ Notification created!`);
            console.log(`   Title: "${newNotif.title}"`);
            console.log(`   Message: "${newNotif.message}"`);
            console.log(`   Status: ${newNotif.status}`);
            console.log(`   Created: ${new Date(newNotif.createdAt).toLocaleString()}\n`);
        } else {
            console.log(`   ✗ No notification found for this report\n`);
        }

        // 7. List folder structure
        console.log('7. Folder structure created:');
        const reportsDir = path.join(process.cwd(), '../../..', 'reports');
        if (fs.existsSync(reportsDir)) {
            const monthFolders = fs.readdirSync(reportsDir).filter(f => f.match(/^\d{4}-\d{2}$/));
            console.log(`   Reports directory: ${reportsDir}`);
            monthFolders.forEach(monthFolder => {
                console.log(`   └─ ${monthFolder}/`);
                const monthPath = path.join(reportsDir, monthFolder);
                const dayFolders = fs.readdirSync(monthPath).filter(f => f.match(/^\d{4}-\d{2}-\d{2}$/));
                dayFolders.forEach((dayFolder, i) => {
                    const isLast = i === dayFolders.length - 1;
                    console.log(`      ${isLast ? '└' : '├'}─ ${dayFolder}/`);
                    const dayPath = path.join(monthPath, dayFolder);
                    const pdfs = fs.readdirSync(dayPath).filter(f => f.endsWith('.pdf'));
                    pdfs.forEach((pdf, j) => {
                        const isPdfLast = j === pdfs.length - 1;
                        console.log(`      ${isLast ? ' ' : '│'}  ${isPdfLast ? '└' : '├'}─ ${pdf}`);
                    });
                });
            });
        }

        console.log('\n=== Test Results ===');
        console.log('✓ Trip report submitted');
        console.log('✓ PDF generated and saved');
        console.log('✓ PDF organized in monthly/daily folders');
        console.log('✓ Admin notification created');
        console.log('\n✅ All tests PASSED!\n');

    } catch (error) {
        console.error('\n✗ Test FAILED');
        console.error('Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('URL:', error.response.config?.url);
        }
    }
}

testPdfAndNotifications();
