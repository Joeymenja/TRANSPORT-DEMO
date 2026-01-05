const { Client } = require('pg');
const axios = require('axios');

const API_URL = 'http://localhost:3003';
const ORG_ID = 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00';

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function demonstrateNotificationSystem() {
    console.log('\n🎯 === NOTIFICATION SYSTEM DEMONSTRATION ===\n');

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Step 1: Show current state
        console.log('📊 STEP 1: Current System State');
        console.log('─'.repeat(50));

        const users = await client.query('SELECT email, role, first_name, last_name, is_active FROM users');
        console.log(`\n👥 Users in system: ${users.rows.length}`);
        users.rows.forEach(u => {
            console.log(`   - ${u.email} (${u.role}) - ${u.first_name} ${u.last_name} [${u.is_active ? 'Active' : 'Inactive'}]`);
        });

        const { data: notifications } = await axios.get(`${API_URL}/notifications`, {
            headers: { 'x-organization-id': ORG_ID }
        });
        console.log(`\n🔔 Current notifications: ${notifications.length}`);
        if (notifications.length > 0) {
            notifications.forEach(n => {
                console.log(`   - [${n.status}] ${n.type}: ${n.title}`);
            });
        }

        // Step 2: Simulate creating a notification by inserting directly to DB
        console.log('\n\n📝 STEP 2: Simulating Driver Registration');
        console.log('─'.repeat(50));
        console.log('Creating a test notification in the database...\n');

        const insertResult = await client.query(`
            INSERT INTO notifications (organization_id, type, title, message, status, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, type, title, status, created_at
        `, [
            ORG_ID,
            'DRIVER_PENDING',
            'New Driver Pending Approval',
            'Feature Trier has registered and is awaiting approval.',
            'UNREAD',
            JSON.stringify({ driverId: 'test-driver-id-123' })
        ]);

        console.log('✅ Notification created successfully!');
        console.log(`   ID: ${insertResult.rows[0].id}`);
        console.log(`   Type: ${insertResult.rows[0].type}`);
        console.log(`   Title: ${insertResult.rows[0].title}`);
        console.log(`   Status: ${insertResult.rows[0].status}`);
        console.log(`   Created: ${insertResult.rows[0].created_at}`);

        // Step 3: Verify through API
        console.log('\n\n🔍 STEP 3: Verifying Through API');
        console.log('─'.repeat(50));

        const { data: unreadNotifications } = await axios.get(`${API_URL}/notifications/unread`, {
            headers: { 'x-organization-id': ORG_ID }
        });

        console.log(`\n✅ Found ${unreadNotifications.length} unread notification(s):`);
        unreadNotifications.forEach((n, i) => {
            console.log(`\n   Notification ${i + 1}:`);
            console.log(`   ├─ Type: ${n.type}`);
            console.log(`   ├─ Title: ${n.title}`);
            console.log(`   ├─ Message: ${n.message}`);
            console.log(`   ├─ Status: ${n.status}`);
            console.log(`   └─ Created: ${new Date(n.createdAt).toLocaleString()}`);
        });

        // Step 4: Create a trip report notification
        console.log('\n\n📋 STEP 4: Simulating Trip Report Submission');
        console.log('─'.repeat(50));

        const reportNotif = await client.query(`
            INSERT INTO notifications (organization_id, type, title, message, status, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, type, title
        `, [
            ORG_ID,
            'TRIP_REPORT_SUBMITTED',
            'Trip Report Submitted',
            'Feature Trier has submitted a trip report for review.',
            'UNREAD',
            JSON.stringify({ tripId: 'trip-123', tripReportId: 'report-456', driverId: 'driver-789' })
        ]);

        console.log('✅ Trip report notification created!');
        console.log(`   ${reportNotif.rows[0].title}\n`);

        // Step 5: Create an incident notification
        console.log('\n📢 STEP 5: Simulating Incident Report (URGENT)');
        console.log('─'.repeat(50));

        const incidentNotif = await client.query(`
            INSERT INTO notifications (organization_id, type, title, message, status, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, type, title
        `, [
            ORG_ID,
            'INCIDENT_REPORTED',
            'Incident Reported',
            'Feature Trier reported an incident in trip report. Please review immediately.',
            'UNREAD',
            JSON.stringify({ tripId: 'trip-123', tripReportId: 'report-456', severity: 'HIGH' })
        ]);

        console.log('🚨 URGENT: Incident notification created!');
        console.log(`   ${incidentNotif.rows[0].title}\n`);

        // Step 6: Final state
        console.log('\n\n📊 STEP 6: Final System State');
        console.log('─'.repeat(50));

        const { data: allNotifications } = await axios.get(`${API_URL}/notifications`, {
            headers: { 'x-organization-id': ORG_ID }
        });

        console.log(`\n🔔 Total notifications: ${allNotifications.length}\n`);
        allNotifications.forEach((n, i) => {
            const icon = n.type === 'INCIDENT_REPORTED' ? '🚨' :
                        n.type === 'TRIP_REPORT_SUBMITTED' ? '📋' : '👤';
            console.log(`   ${icon} [${n.status}] ${n.title}`);
        });

        // Instructions
        console.log('\n\n🌐 NEXT STEPS: Test in Browser');
        console.log('='.repeat(50));
        console.log('\n1. Open your browser and go to: http://localhost:3000');
        console.log('\n2. Login with admin user:');
        console.log('   Email: admin.feature@example.com');
        console.log('   (Check database for password or reset if needed)');
        console.log('\n3. Look for the notification bell 🔔 in the top-right corner');
        console.log('   - Should show a red badge with number "3"');
        console.log('   - Click to see the dropdown with all notifications');
        console.log('   - Click a notification to navigate to related page');
        console.log('   - Click "Mark All as Read" to clear');
        console.log('\n4. Test creating real notifications:');
        console.log('   - Create a new driver → New notification appears');
        console.log('   - Submit a trip report → New notification appears');
        console.log('   - Report incident → URGENT notification appears');
        console.log('\n✅ Demonstration complete!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('   API Error:', error.response.status, error.response.data);
        }
    } finally {
        await client.end();
    }
}

demonstrateNotificationSystem();
