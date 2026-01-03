const axios = require('axios');
const { Client } = require('pg');

const API_BASE = 'http://localhost:3000/api';
const AUTH_API = 'http://localhost:3001/api';
const MEMBER_API = 'http://localhost:3002/api';

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

let authToken = '';
let organizationId = '';
let userId = '';
let testTripId = '';
let testDriverId = '';
let testMemberId = '';
let testVehicleId = '';

async function log(message, data = null) {
    console.log(`\n✓ ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

async function error(message, err) {
    console.error(`\n✗ ${message}`);
    console.error(err.response?.data || err.message);
}

async function testLogin() {
    try {
        log('=== STEP 1: Testing Login ===');
        const response = await axios.post(`${AUTH_API}/auth/login`, {
            email: 'admin@gvbh.com',
            password: 'password123'
        });

        authToken = response.data.token;
        organizationId = response.data.user.organizationId;
        userId = response.data.user.id;

        log('Login successful', {
            userId: userId.substring(0, 8),
            organizationId: organizationId.substring(0, 8),
            role: response.data.user.role
        });
        return true;
    } catch (err) {
        error('Login failed', err);
        return false;
    }
}

async function getTestData() {
    try {
        await client.connect();
        log('=== STEP 2: Fetching Test Data ===');

        // Get a member
        const memberResult = await client.query(
            'SELECT id, first_name, last_name FROM members WHERE organization_id = $1 LIMIT 1',
            [organizationId]
        );

        if (memberResult.rows.length === 0) {
            throw new Error('No members found. Please seed the database first.');
        }

        testMemberId = memberResult.rows[0].id;
        log('Found test member', {
            id: testMemberId.substring(0, 8),
            name: `${memberResult.rows[0].first_name} ${memberResult.rows[0].last_name}`
        });

        // Get an active driver
        const driverResult = await client.query(
            'SELECT id, first_name, last_name, is_active FROM users WHERE organization_id = $1 AND role = $2 AND is_active = true LIMIT 1',
            [organizationId, 'DRIVER']
        );

        if (driverResult.rows.length === 0) {
            console.warn('⚠️  No active drivers found. Will test without driver assignment.');
        } else {
            testDriverId = driverResult.rows[0].id;
            log('Found active driver', {
                id: testDriverId.substring(0, 8),
                name: `${driverResult.rows[0].first_name} ${driverResult.rows[0].last_name}`,
                isActive: driverResult.rows[0].is_active
            });
        }

        // Get a vehicle
        const vehicleResult = await client.query(
            'SELECT id, make, model, license_plate FROM vehicles WHERE organization_id = $1 LIMIT 1',
            [organizationId]
        );

        if (vehicleResult.rows.length > 0) {
            testVehicleId = vehicleResult.rows[0].id;
            log('Found test vehicle', {
                id: testVehicleId.substring(0, 8),
                vehicle: `${vehicleResult.rows[0].make} ${vehicleResult.rows[0].model}`,
                plate: vehicleResult.rows[0].license_plate
            });
        }

        return true;
    } catch (err) {
        error('Failed to fetch test data', err);
        return false;
    }
}

async function testCreateTrip() {
    try {
        log('=== STEP 3: Creating Test Trip ===');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const tripData = {
            tripDate: tomorrow.toISOString(),
            mobilityRequirement: 'WHEELCHAIR',
            members: [{ memberId: testMemberId }],
            stops: [
                {
                    stopType: 'PICKUP',
                    stopOrder: 1,
                    address: '123 Home St, Phoenix, AZ 85001',
                    scheduledTime: tomorrow.toISOString()
                },
                {
                    stopType: 'DROPOFF',
                    stopOrder: 2,
                    address: '456 Hospital Ave, Phoenix, AZ 85002',
                    scheduledTime: new Date(tomorrow.getTime() + 30 * 60000).toISOString()
                }
            ]
        };

        const response = await axios.post(`${API_BASE}/trips`, tripData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId,
                'X-User-ID': userId
            }
        });

        testTripId = response.data.id;
        log('Trip created successfully', {
            tripId: testTripId.substring(0, 8),
            status: response.data.status,
            mobilityRequirement: response.data.mobilityRequirement,
            memberCount: response.data.memberCount,
            stopCount: response.data.stops?.length
        });

        return true;
    } catch (err) {
        error('Trip creation failed', err);
        return false;
    }
}

async function testAssignDriver() {
    if (!testDriverId) {
        console.log('\n⚠️  Skipping driver assignment (no active driver available)');
        return true;
    }

    try {
        log('=== STEP 4: Assigning Driver & Vehicle ===');

        const updateData = {
            assignedDriverId: testDriverId,
            assignedVehicleId: testVehicleId,
            status: 'SCHEDULED'
        };

        const response = await axios.patch(`${API_BASE}/trips/${testTripId}`, updateData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId,
                'X-User-ID': userId
            }
        });

        log('Driver assigned successfully', {
            tripId: testTripId.substring(0, 8),
            driverId: response.data.assignedDriverId?.substring(0, 8),
            vehicleId: response.data.assignedVehicleId?.substring(0, 8),
            status: response.data.status
        });

        return true;
    } catch (err) {
        error('Driver assignment failed', err);
        return false;
    }
}

async function testStartTrip() {
    try {
        log('=== STEP 5: Starting Trip ===');

        const response = await axios.post(`${API_BASE}/trips/${testTripId}/start`, {}, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId,
                'X-User-ID': userId
            }
        });

        log('Trip started successfully', {
            tripId: testTripId.substring(0, 8),
            status: response.data.status
        });

        return true;
    } catch (err) {
        error('Trip start failed', err);
        return false;
    }
}

async function testStopArrival() {
    try {
        log('=== STEP 6: Recording Stop Arrival ===');

        // Get the first stop
        const tripResponse = await axios.get(`${API_BASE}/trips/${testTripId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId
            }
        });

        const firstStop = tripResponse.data.stops[0];

        const updateData = {
            actualArrivalTime: new Date().toISOString(),
            gpsLatitude: 33.4484,
            gpsLongitude: -112.0740,
            odometerReading: 12345
        };

        await axios.patch(`${API_BASE}/trips/${testTripId}/stops/${firstStop.id}`, updateData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId
            }
        });

        log('Stop arrival recorded', {
            stopId: firstStop.id.substring(0, 8),
            stopType: firstStop.stopType,
            gps: `${updateData.gpsLatitude}, ${updateData.gpsLongitude}`
        });

        return true;
    } catch (err) {
        error('Stop arrival recording failed', err);
        return false;
    }
}

async function testSignature() {
    try {
        log('=== STEP 7: Capturing Member Signature ===');

        // Get trip members
        const tripResponse = await axios.get(`${API_BASE}/trips/${testTripId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId
            }
        });

        const member = tripResponse.data.members[0];

        const signatureData = {
            signatureBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            isProxySignature: false
        };

        await axios.post(`${API_BASE}/trips/${testTripId}/members/${member.id}/signature`, signatureData, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId
            }
        });

        log('Signature captured successfully', {
            memberId: member.id.substring(0, 8),
            isProxy: signatureData.isProxySignature
        });

        return true;
    } catch (err) {
        error('Signature capture failed', err);
        return false;
    }
}

async function testCompleteTrip() {
    try {
        log('=== STEP 8: Completing Trip ===');

        const response = await axios.post(`${API_BASE}/trips/${testTripId}/complete`, {}, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId,
                'X-User-ID': userId
            }
        });

        log('Trip completed successfully', {
            tripId: testTripId.substring(0, 8),
            status: response.data.status
        });

        return true;
    } catch (err) {
        error('Trip completion failed', err);
        return false;
    }
}

async function testPDFGeneration() {
    try {
        log('=== STEP 9: Generating PDF Report ===');

        const response = await axios.get(`${API_BASE}/trips/${testTripId}/report`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-Organization-ID': organizationId
            },
            responseType: 'arraybuffer'
        });

        const pdfSize = response.data.byteLength;

        log('PDF generated successfully', {
            tripId: testTripId.substring(0, 8),
            sizeKB: (pdfSize / 1024).toFixed(2)
        });

        return true;
    } catch (err) {
        error('PDF generation failed', err);
        return false;
    }
}

async function runTests() {
    console.log('\n🚀 Starting End-to-End Platform Test\n');
    console.log('='.repeat(50));

    const results = {
        passed: 0,
        failed: 0,
        skipped: 0
    };

    try {
        // Run tests sequentially
        if (await testLogin()) results.passed++; else results.failed++;
        if (await getTestData()) results.passed++; else results.failed++;
        if (await testCreateTrip()) results.passed++; else results.failed++;
        if (await testAssignDriver()) results.passed++; else results.failed++;
        if (await testStartTrip()) results.passed++; else results.failed++;
        if (await testStopArrival()) results.passed++; else results.failed++;
        if (await testSignature()) results.passed++; else results.failed++;
        if (await testCompleteTrip()) results.passed++; else results.failed++;
        if (await testPDFGeneration()) results.passed++; else results.failed++;

    } catch (err) {
        console.error('\n❌ Unexpected error:', err.message);
        results.failed++;
    } finally {
        await client.end();
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Results:');
    console.log(`   ✅ Passed: ${results.passed}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    console.log(`   ⚠️  Skipped: ${results.skipped}`);

    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Platform is working end-to-end.\n');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    }
}

runTests();
