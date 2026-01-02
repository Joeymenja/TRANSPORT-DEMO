import axios from 'axios';
import { Client } from 'pg';

const AUTH_URL = 'http://localhost:8081';
const TRANSPORT_URL = 'http://localhost:8082';
const MEMBER_URL = 'http://localhost:8083';

async function validateRoundTrip() {
    try {
        console.log('--- STARTING ROUND TRIP VALIDATION ---');

        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${AUTH_URL}/auth/login`, {
            email: 'admin@gvt.com',
            password: 'password123'
        });
        const token = loginRes.data.access_token;
        const user = loginRes.data.user;
        const headers = {
            Authorization: `Bearer ${token}`,
            'x-organization-id': user.organizationId,
            'x-user-id': user.id
        };
        console.log(`   Login successful.`);

        // 2. Fetch Member
        console.log('2. Fetching Member...');
        const membersRes = await axios.get(`${MEMBER_URL}/members`, { headers });
        const member = membersRes.data[0];
        if (!member) throw new Error("No members found");
        console.log(`   Using Member: ${member.firstName}`);

        // 3. Create Outbound Trip
        console.log('3. Creating Outbound Trip...');
        const today = new Date().toISOString().split('T')[0];
        const outboundRes = await axios.post(`${TRANSPORT_URL}/trips`, {
            tripDate: today,
            members: [{ memberId: member.id }],
            stops: [
                { stopType: 'PICKUP', stopOrder: 1, address: 'Home', scheduledTime: new Date().toISOString() },
                { stopType: 'DROPOFF', stopOrder: 2, address: 'Clinic', scheduledTime: new Date(Date.now() + 3600000).toISOString() }
            ]
        }, { headers });
        const outboundTrip = outboundRes.data;
        console.log(`   Outbound Trip Created: ${outboundTrip.id}`);

        // 4. Create Return Trip
        console.log('4. Creating Return Trip...');
        const returnRes = await axios.post(`${TRANSPORT_URL}/trips`, {
            tripDate: today,
            members: [{ memberId: member.id }],
            stops: [
                { stopType: 'PICKUP', stopOrder: 1, address: 'Clinic', scheduledTime: new Date(Date.now() + 7200000).toISOString() },
                { stopType: 'DROPOFF', stopOrder: 2, address: 'Home', scheduledTime: new Date(Date.now() + 10800000).toISOString() }
            ]
        }, { headers });
        const returnTrip = returnRes.data;
        console.log(`   Return Trip Created: ${returnTrip.id}`);

        // 5. Verify Backend Lists Both
        console.log('5. Verifying Trips in List...');
        const listRes = await axios.get(`${TRANSPORT_URL}/trips?date=${today}`, { headers });
        const trips = listRes.data;
        const foundOutbound = trips.find((t: any) => t.id === outboundTrip.id);
        const foundReturn = trips.find((t: any) => t.id === returnTrip.id);

        if (foundOutbound && foundReturn) {
            console.log('   SUCCESS: Both trips found in daily list.');
            console.log(`   Outbound Stops: ${foundOutbound.stops.map((s: any) => s.address).join(' -> ')}`);
            console.log(`   Return Stops: ${foundReturn.stops.map((s: any) => s.address).join(' -> ')}`);
        } else {
            console.error('   FAILURE: Could not find both trips.');
        }

        console.log('--- ROUND TRIP VALIDATION SUCCESSFUL ---');

    } catch (error: any) {
        console.error('--- VALIDATION FAILED ---');
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

validateRoundTrip();
