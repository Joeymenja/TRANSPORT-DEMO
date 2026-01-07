// Native fetch in Node 18+


async function verifyAdminSync() {
    try {
        console.log('--- 1. Verification: Admin Login ---');
        const loginPayload = {
            email: 'admin@gvbh.com',
            password: 'password123'
        };

        const loginRes = await fetch('http://localhost:8081/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) {
            throw new Error(`Admin login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.access_token || loginData.accessToken;
        const orgId = loginData.user.organizationId;
        console.log('Admin Logged In. Org ID:', orgId);

        console.log('\n--- 2. Verification: Admin Trip Dashboard ---');
        // Fetch trips as Admin sees them
        const tripsRes = await fetch(`http://localhost:3003/trips`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Organization-ID': orgId
            }
        });

        if (!tripsRes.ok) {
            throw new Error(`Failed to fetch admin trips: ${tripsRes.status} ${await tripsRes.text()}`);
        }

        const trips = await tripsRes.json();
        console.log(`Admin sees ${trips.length} trips.`);
        
        // Find our demo trip
        const targetTripId = '38d9c55b-4557-4590-9c29-a36800f23037';
        const demoTrip = trips.find(t => t.id === targetTripId || t.id.startsWith('38d9c')); // ID from previous run
        if (demoTrip) {
            console.log('✅ SUCCESS: Demo Trip (0e598...) IS VISIBLE to Admin.');
            console.log(`   - Status: ${demoTrip.status}`);
            console.log(`   - Assigned Driver: ${demoTrip.assignedDriverId}`);
        } else {
            console.log('❌ FAILURE: Demo Trip (0e598...) NOT FOUND in Admin list.');
            if (trips.length > 0) {
                console.log('   - Latest Trip ID:', trips[0].id);
            }
        }

        console.log('\n--- 3. Verification: Activity Logs ---');
        // Fetch activity logs
        const logsRes = await fetch(`http://localhost:3003/activity-logs?limit=5`, {
             method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Organization-ID': orgId
            }
        });

        if (logsRes.ok) {
            const logs = await logsRes.json();
            console.log(`Fetched ${logs.length} recent logs.`);
            const createLog = logs.find(l => l.details && l.details.includes('0e598'));
            if (createLog) {
                console.log('✅ SUCCESS: Trip Creation Event is LOGGED.');
                console.log(`   - Message: ${createLog.message}`);
            } else {
                console.log('⚠️ WARNING: Specific creation log for demo trip not found in top 5.');
                console.log('   - Recent logs:', logs.map(l => l.message));
            }
        } else {
            console.log('⚠️ Failed to fetch activity logs:', await logsRes.text());
        }

    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifyAdminSync();
