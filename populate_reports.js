
const axios = require('axios');

const AUTH_URL = 'http://localhost:8081/auth';
const TRANSPORT_URL = 'http://localhost:8082';
const DRIVER_EMAIL = 'new.driver@gvbh.com';
const DRIVER_PASSWORD = 'password123';

// Mock Data Generators
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomTime = (baseDate, hoursOffset) => {
    const d = new Date(baseDate);
    d.setHours(d.getHours() + hoursOffset);
    return d.toISOString();
};

async function main() {
    try {
        console.log('1. Logging in as Driver...');
        const loginRes = await axios.post(`${AUTH_URL}/login`, {
            email: DRIVER_EMAIL,
            password: DRIVER_PASSWORD
        });
        console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
        const token = loginRes.data.access_token || loginRes.data.accessToken;
        const user = loginRes.data.user;
        console.log(`   Logged in as ${user.firstName} ${user.lastName}`);
        
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'x-organization-id': user.organizationId
        };

        console.log('2. Fetching assigned trips...');
        // Driver sees their own trips
        // We need to find the driver ID first? No, the /trips endpoint for drivers usually returns their own trips if filtered?
        // Let's assume /trips works or use /driver/trips if it exists. 
        // Based on previous checks, /trips usually takes a memberId or filtering.
        // Let's try fetching "all" trips and filtering in memory (since we are authenticated as driver, maybe it restricts?)
        // Or better: Use the endpoint the frontend uses: /trips?startDate=...
        
        const today = new Date().toISOString().split('T')[0];
        const tripsRes = await axios.get(`${TRANSPORT_URL}/trips`, { headers });
        console.log('API Response Status:', tripsRes.status);
        // console.log('API Response Data:', JSON.stringify(tripsRes.data).substring(0, 200));
        
        let trips = tripsRes.data;
        if (!Array.isArray(trips)) {
            console.log('Response is not an array:', trips);
            trips = [];
        }
        
        // If empty, we can't do much as a driver unless we have admin rights to create.
        // But we know 'submit-trip-reports-directly.js' found 10 trips.
        // So trips SHOULD exist.
        
        console.log(`Found ${trips.length} trips.`);

        let processedCount = 0;

        for (const trip of trips) {
            if (processedCount >= 3) break; // Limit to 3 PDFs
            
            // Skip if already has a report
            if (trip.reportStatus && trip.reportStatus !== 'PENDING') { 
                 // PENDING means Pending Approval (submitted), so skip those too if we want fresh ones.
                 // Actually, let's look for trips WITHOUT a report or with 'PENDING' report status if we want to overwrite?
                 // The API says report status is PENDING (approval) after submission.
                 if (trip.reportStatus === 'SUBMITTED' || trip.reportStatus === 'PENDING') continue;
            }

            console.log(`Processing Trip ${trip.id}...`);

            // 1. Start Trip (if needed)
            if (trip.status === 'SCHEDULED') {
                 try {
                    await axios.post(`${TRANSPORT_URL}/trips/${trip.id}/start`, {}, { headers });
                    console.log('  - Trip Started');
                 } catch (e) {
                     // Ignore if already started
                 }
            }

            // 2. Submit Report
            const reportPayload = {
                tripData: {
                    pickupTime: getRandomTime(trip.tripDate, 0),
                    dropoffTime: getRandomTime(trip.tripDate, 1),
                    startOdometer: 10000 + getRandomInt(0, 100),
                    endOdometer: 10020 + getRandomInt(0, 100),
                    totalMiles: 20,
                    serviceVerified: true,
                    clientArrived: true,
                    incidentReported: false,
                    notes: 'Smooth trip, no issues.',
                },
                signatureData: {
                    // Simple base64 dot
                    signatureBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                    isProxySignature: false
                }
            };

            await axios.post(`${TRANSPORT_URL}/trips/${trip.id}/report/submit`, reportPayload, { headers });
            console.log(`  - Report Submitted for Trip ${trip.id}`);
        }

        console.log('Done!');

    } catch (error) {
        console.error('FULL ERROR:', error);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

main();
