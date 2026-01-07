// using built-in fetch

async function run() {
    try {
        console.log('--- 1. Login ---');
        const loginRes = await fetch('http://localhost:8081/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'new.driver@gvbh.com', password: 'password123' })
        });

        if (!loginRes.ok) {
            console.error('Login Failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        const user = loginData.user;
        const orgId = user.organizationId;

        console.log('Login Success.');
        console.log('Token:', token.substring(0, 20) + '...');
        console.log('Org ID:', orgId);
        console.log('User ID:', user.id);

        if (!orgId) {
            console.error('CRITICAL: Organization ID is missing from login response!');
            return;
        }

        console.log('\n--- 2. Create Trip ---');
        // Fetch a member first? No, for demo, let's try to fetch members or just use a dummy one if we can't find one.
        // Actually, let's use the API to get members to be realistic.
        const membersRes = await fetch('http://localhost:8083/members', { // Member Service Port 8083? Check vite config: yes 8083
             headers: { 
                 'Authorization': `Bearer ${token}`,
                 'X-Organization-ID': orgId
             }
        });

        let memberId;
        if (membersRes.ok) {
            const members = await membersRes.json();
            if (members.length > 0) memberId = members[0].id;
        }
        if (!memberId) {
            console.log('No members found. Creating one...');
            const crypto = require('crypto');
            const newMemberId = crypto.randomUUID();
            
            const createMemberRes = await fetch('http://localhost:8083/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Organization-ID': orgId,
                    'X-User-ID': user.id
                },
                body: JSON.stringify({
                    memberId: newMemberId,
                    firstName: "Test",
                    lastName: "Member",
                    dateOfBirth: "1980-01-01",
                    phone: "555-0101",
                    address: "123 Test St, Test City, AZ 85001",
                    mobilityRequirement: "AMBULATORY",
                    specialNotes: "Created by test script"
                })
            });
            if (createMemberRes.ok) {
                const newMember = await createMemberRes.json();
                memberId = newMember.id; // API might return 'id' or 'memberId' depending on entity/dto mapping
                console.log('Created Member ID:', memberId);
            } else {
                 console.error('Failed to create member:', await createMemberRes.text());
                 return;
            }
        }
        console.log('Using Member ID:', memberId);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tripPayload = {
            tripDate: tomorrow.toISOString(),
            assignedDriverId: user.id,
            tripType: 'PICK_UP',
            members: [{ memberId: memberId }], 
            stops: [
                {
                    stopType: 'PICKUP',
                    stopOrder: 1,
                    address: '1 Main St, Mesa, AZ 85201', // Note: MobileDriverDashboard sends 'address' but CreateTripDto expects street, city, etc?
                    // Wait! MobileDriverDashboard sends `address` (line 79).
                    // TripController expects `CreateTripDto`.
                    // src/dto/trip.dto.ts -> TripStopDto expects street, city, state, zipCode.
                    // THIS MIGHT BE THE ISSUE! Schema mismatch!
                    // Let's create it EXACTLY as MobileDriverDashboard does to see if it fails with "null org id" or "validation error".
                    address: '1 Main St, Mesa, AZ 85201', 
                    scheduledTime: tomorrow.toISOString()
                },
                {
                    stopType: 'DROPOFF',
                    stopOrder: 2,
                    address: 'Phoenix Sky Harbor',
                    scheduledTime: new Date(tomorrow.getTime() + 3600000).toISOString()
                }
            ]
        };
        
        // Wait, if schema is wrong, it should be 400 Bad Request, not 500 null org id.
        // Unless... the validation pipe strips unknown properties and leaves required ones undefined -> then code tries use them -> db error?
        // But orgId helps save the trip *before* saving stops?
        // Trip is saved first.
        
        const tripRes = await fetch('http://localhost:3003/trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Organization-ID': orgId,
                'X-User-ID': user.id
            },
            body: JSON.stringify(tripPayload)
        });

        if (tripRes.ok) {
            console.log('Trip Creation SUCCESS!');
            const trip = await tripRes.json();
            console.log('Trip ID:', trip.id);
        } else {
            console.error('Trip Creation FAILED:', tripRes.status, tripRes.statusText);
            const text = await tripRes.text();
            console.error('Response:', text);
        }

    } catch (err) {
        console.error('Error Details:', err);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

run();
