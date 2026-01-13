// using native fetch


// Helper to handle requests
async function request(url, method = 'GET', body = null, token = null, headers = {}) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Request to ${url} failed (${res.status}): ${txt}`);
    }
    return res.json();
}

(async () => {
    try {
        console.log('--- Scheduling Intake for Eric Manager ---');

        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const authUrl = 'http://localhost:8081'; // Auth service
        const transportUrl = 'http://localhost:8082'; // Transport service
        
        const loginRes = await request(`${authUrl}/auth/login`, 'POST', {
            email: 'admin@gvbh.com',
            password: 'password123'
        });
        
        const token = loginRes.accessToken || loginRes.token;
        const user = loginRes.user;
        const orgId = user.organizationId;
        
        if (!token) throw new Error('No token returned from login');
        console.log('Login successful. Org ID:', orgId);

        // 2. Check for Member 'Eric Manager'
        console.log('Searching for member Eric Manager...');
        const members = await request(`${transportUrl}/members`, 'GET', null, token);
        
        let eric = members.find(m => 
            (m.firstName?.toLowerCase() === 'eric' && m.lastName?.toLowerCase() === 'manager') ||
            (m.memberId === 'A06374910')
        );

        if (eric) {
            console.log('Member found:', eric.id);
        } else {
            console.log('Member not found. Creating Eric Manager...');
            const newMemberData = {
                firstName: 'Eric',
                lastName: 'Manager',
                memberId: 'A06374910',
                dateOfBirth: '1991-09-28',
                organizationId: orgId,
                isActive: true,
                gender: 'M', // Assumption
                
                // Address from request: 1550 west carmen street phoenix az 85041
                address: '1550 West Carmen Street, Phoenix, AZ 85041',
                
                mobilityRequirement: 'AMBULATORY', // Assumption
                phone: '555-0100' // Dummy phone
            };
            
            // Note: POST /members might expect x-organization-id header or get it from token/body
            // Let's try sending it in body first as per interface
            
            eric = await request(`${transportUrl}/members`, 'POST', newMemberData, token, { 'x-organization-id': orgId });
            console.log('Member created:', eric.id);
        }

        // 3. Create Trip
        console.log('Creating Trip...');
        
        // Schedule for tomorrow 10:00 AM
        const tripDate = new Date();
        tripDate.setDate(tripDate.getDate() + 1);
        tripDate.setHours(10, 0, 0, 0);

        const pickupTime = new Date(tripDate);
        
        // Estimate dropoff 45 mins later
        const dropoffTime = new Date(pickupTime.getTime() + 45 * 60000);

        const tripPayload = {
            tripDate: tripDate.toISOString(),
            tripType: 'PICK_UP', // One way to destination
            status: 'SCHEDULED', // Auto-schedule
            mobilityRequirement: eric.mobilityRequirement || 'AMBULATORY',
            members: [{ memberId: eric.id }],
            stops: [
                {
                    stopType: 'PICKUP',
                    stopOrder: 1,
                    address: '1550 West Carmen Street, Phoenix, AZ 85041',
                    scheduledTime: pickupTime.toISOString()
                },
                {
                    stopType: 'DROPOFF',
                    stopOrder: 2,
                    address: 'Estrella De Vida, 2613 West Campbell Ave, Phoenix, AZ',
                    scheduledTime: dropoffTime.toISOString()
                }
            ],
            reasonForVisit: 'Intake'
        };

        // Header Requirements for Create Trip usually include x-organization-id
        const tripHeaders = {
            'x-organization-id': orgId,
            'x-user-id': user.id
        };

        const newTrip = await request(`${transportUrl}/trips`, 'POST', tripPayload, token, tripHeaders);
        console.log('Successfully scheduled trip!');
        console.log('Trip ID:', newTrip.id);
        console.log('Date:', newTrip.tripDate);
        console.log('Stops:', newTrip.stops.map(s => `${s.stopType}: ${s.address}`).join(' -> '));

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
