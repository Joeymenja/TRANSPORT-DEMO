// Native fetch in Node 18+

// Trip and Driver IDs from previous successful run
// Trip ID: 0e598d74-a77a-4fd3-b5aa-c08f3ebb171a
// User ID used as Driver: ce28d5a1-a60a-4309-994e-9e228c73bc60
const TRIP_ID = '0e598d74-a77a-4fd3-b5aa-c08f3ebb171a'; 
const DRIVER_USER_ID = 'ce28d5a1-a60a-4309-994e-9e228c73bc60';
const ORG_ID = 'f0578ebc-c7e9-4d1b-8cb9-6fab3b565c00';

// We need the ACTUAL Driver ID for the report, not the User ID.
// The refactored TripService handles this mapping for Trip Creation, but the Report Controller 
// expects `driverId` in the body. If the frontend sends User ID, it might fail here if the controller doesn't map it.
// Let's first look up the Driver ID for this user to be safe, or see if we can use User ID and rely on a fix?
// Actually, let's try sending the User ID first, as that mimics what the frontend likely does (since it had the issue).
// If that fails, we know we need to fix the controller to resolve User->Driver ID like the service does.

async function testSubmitReport() {
    try {
        console.log('--- 1. Login to get Token ---');
        const loginRes = await fetch('http://localhost:8081/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'new.driver@gvbh.com', password: 'password123' })
        });
        
        if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
        const { access_token, user } = await loginRes.json();
        const token = access_token;
        console.log('Logged in. Token acquired.');

        console.log('\n--- 2. Resolve Driver ID (Simulation) ---');
        // We need to know what ID to send. If the frontend sends User ID, and the backend expects Driver entity ID (UUID),
        // and there is no conversion in the controller, it will fail with "invalid input syntax for type uuid" or FK violation.
        
        // Let's try to hit the endpoint with the setup we have.
        // Endpoint: POST /reports/trip/:tripId/submit
        
        const payload = {
            driverId: user.id, // Sending User ID to see if it breaks (reproducing frontend behavior)
            startOdometer: 1000,
            endOdometer: 1010,
            pickupTime: new Date().toISOString(),
            dropoffTime: new Date(Date.now() + 3600000).toISOString(),
            notes: 'Test report from script',
            serviceVerified: true,
            clientArrived: true,
            incidentReported: false,
            // Simple signature
            clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' 
        };

        console.log(`Submitting report for Trip ${TRIP_ID}...`);
        console.log('Payload Driver ID:', payload.driverId);

        const res = await fetch(`http://localhost:3003/reports/trip/${TRIP_ID}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Organization-ID': ORG_ID
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log('✅ Report Submitted Successfully!');
            const data = await res.json();
            console.log('Report ID:', data.id);
            console.log('Status:', data.status);
            console.log('PDF Path:', data.pdfFilePath);
        } else {
            console.error('❌ Report Submission FAILED:', res.status, res.statusText);
            console.error('Response:', await res.text());
        }

    } catch (err) {
        console.error('Test Error:', err);
    }
}

testSubmitReport();
