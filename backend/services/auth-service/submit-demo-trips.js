const axios = require('axios');

const AUTH_SERVICE_URL = 'http://localhost:8081';
const TRANSPORT_SERVICE_URL = 'http://localhost:8082';

// Demo driver credentials (from database)
const DEMO_DRIVERS = [
    { email: 'new.driver@gvbh.com', password: 'password123', name: 'New Driver' },
    { email: 'test.feature.try@example.com', password: 'password123', name: 'Feature Trier' }
];

async function loginDriver(email, password) {
    try {
        const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to login ${email}:`, error.response?.data || error.message);
        return null;
    }
}

async function getDriverTrips(token, orgId) {
    try {
        // Try to get trips without date filter to get all assigned trips
        const response = await axios.get(`${TRANSPORT_SERVICE_URL}/api/trips`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                organizationId: orgId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get trips:', error.response?.data || error.message);
        return [];
    }
}

async function getDriverInfo(token) {
    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get driver info:', error.message);
        return null;
    }
}

async function submitTripReport(token, tripId, reportData) {
    try {
        const response = await axios.post(
            `${TRANSPORT_SERVICE_URL}/api/trips/${tripId}/report`,
            reportData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log(`✓ Successfully submitted report for trip ${tripId}`);
        return response.data;
    } catch (error) {
        console.error(`✗ Failed to submit report for trip ${tripId}:`, error.response?.data || error.message);
        return null;
    }
}

async function createDemoTripReport(token, trip) {
    // Create a realistic trip report
    const now = new Date();
    const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const endTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago

    const reportData = {
        startOdometer: trip.assignedVehicle?.odometer || 15000,
        endOdometer: (trip.assignedVehicle?.odometer || 15000) + Math.floor(Math.random() * 50 + 10),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: 'Trip completed successfully. All passengers picked up and dropped off on time.',
        incidents: [],
        weatherConditions: 'Clear',
        trafficConditions: 'Light'
    };

    return await submitTripReport(token, trip.id, reportData);
}

async function main() {
    console.log('\n=== DRIVER LOGIN INFORMATION ===\n');
    console.log('Driver accounts for testing:\n');

    DEMO_DRIVERS.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.name}`);
        console.log(`   Email: ${driver.email}`);
        console.log(`   Password: ${driver.password}`);
        console.log(`   Login URL: http://localhost:3001/driver/login`);
        console.log('');
    });

    console.log('\n=== SUBMITTING DEMO TRIP REPORTS ===\n');

    for (const driver of DEMO_DRIVERS) {
        console.log(`\nProcessing driver: ${driver.name} (${driver.email})`);

        // Login as driver
        const authData = await loginDriver(driver.email, driver.password);
        if (!authData) {
            console.log(`  ✗ Could not login driver ${driver.name}`);
            continue;
        }

        console.log(`  ✓ Logged in successfully`);

        // Get driver's assigned trips
        const trips = await getDriverTrips(authData.accessToken, authData.user.organizationId);
        console.log(`  Found ${trips.length} trip(s)`);

        if (trips.length === 0) {
            console.log(`  No trips assigned to ${driver.name}`);
            continue;
        }

        // Submit reports for each trip
        for (const trip of trips) {
            if (trip.reportStatus === 'PENDING' || !trip.reportStatus) {
                console.log(`  Submitting report for trip ${trip.id}...`);
                await createDemoTripReport(authData.accessToken, trip);
            } else {
                console.log(`  Trip ${trip.id} already has a report (status: ${trip.reportStatus})`);
            }
        }
    }

    console.log('\n=== COMPLETE ===\n');
}

main().catch(console.error);
