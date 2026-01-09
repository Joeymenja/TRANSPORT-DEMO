const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function seedTrips() {
    console.log('--- STARTING PHASE 2: TRIPS SEEDING (Full Restore Trip 1) ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Fetch dependencies
        // Org
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        if (orgRes.rows.length === 0) throw new Error('Org not found! Run Phase 1.');
        const orgId = orgRes.rows[0].id;

        // Users
        const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@gvbh-demo.com'");
        const adminId = adminRes.rows[0].id;

        const driverUserRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvbh-demo.com'");
        const driverUserId = driverUserRes.rows[0].id;
        
        const driverRes = await client.query("SELECT id FROM drivers WHERE user_id = $1", [driverUserId]);
        const driverId = driverRes.rows[0].id;

        // Vehicle (V-001)
        const vehicleRes = await client.query("SELECT id FROM vehicles WHERE vehicle_number = 'V-001'");
        const vehicleId = vehicleRes.rows[0].id;

        // Member A (DEMO-A) - partial match or exact?
        // seed-01 created 'DEMO-A-...' 
        const memberARes = await client.query("SELECT id FROM members WHERE member_id LIKE 'DEMO-A-%' LIMIT 1");
        const memberAId = memberARes.rows[0].id;

        console.log('Dependencies:', { orgId, adminId, driverId, vehicleId, memberAId });

const fs = require('fs');
const path = require('path');

// ... (existing imports)

        // 2. Create Trip 1 (Completed)
        const todayDate = new Date().toISOString().split('T')[0];
        // Fixed UUID for easy verification
        const trip1Id = '50125c11-9258-4504-98C0-2921a4f00001'; 
        const reportPath = 'reports/seeded-report.pdf';

        console.log('Inserting Trip 1...');
        await client.query(
            `INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status, report_file_path) 
             VALUES ($1, $2, $3, $4, $5, $6, 'PICK_UP', 'COMPLETED', $7)`,
            [trip1Id, orgId, todayDate, adminId, driverId, vehicleId, reportPath]
        );

        // Create dummy report file
        const fullReportPath = path.join(process.cwd(), '../../../', reportPath); // Adjust for cwd being in services/transport-service
        // Actually process.cwd() when running "node seed-02.js" is the dir.
        // We want it in project root/reports usually? 
        // PdfService uses path.join(process.cwd(), 'reports') where process.cwd() is project root.
        // If we run `npm run dev` from root, cwd is root.
        // If we run `node seed...` from `backend/services/transport-service`, cwd is different.
        // Let's assume verifying uses the running api which runs from root (usually).
        // So reportPath 'reports/seeded-report.pdf' means <root>/reports/seeded-report.pdf.
        // So we should write to <root>/reports/seeded-report.pdf.
        const reportsDir = path.join(__dirname, 'reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
        fs.writeFileSync(path.join(reportsDir, 'seeded-report.pdf'), 'Dummy PDF Content');


        // Stops
        // Use exact confirmed query structure from test
        const stop1Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (
              id, organization_id, trip_id, stop_type, stop_order, address, 
              scheduled_time, actual_arrival_time, actual_departure_time, 
              gps_latitude, gps_longitude, odometer_reading, 
              created_at, updated_at
           ) 
           VALUES (
              $1::uuid, $2, $3, 'PICKUP', 1, '123 Demo St, Phoenix, AZ',
              $4, $5, $6, 
              33.4484, -112.0740, 10500, 
              NOW(), NOW()
           )`,
            [
                stop1Id, orgId, trip1Id,
                new Date(todayDate + 'T08:00:00'),
                new Date(todayDate + 'T08:05:00'),
                new Date(todayDate + 'T08:10:00')
            ]
        );

        const stop2Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (
              id, organization_id, trip_id, stop_type, stop_order, address, 
              scheduled_time, actual_arrival_time, actual_departure_time, 
              gps_latitude, gps_longitude, odometer_reading, 
              created_at, updated_at
           ) 
           VALUES (
              $1::uuid, $2, $3, 'DROPOFF', 2, '456 Demo Clinic, Phoenix, AZ',
              $4, $5, $6, 
              33.4510, -112.0670, 10505, 
              NOW(), NOW()
           )`,
            [
                stop2Id, orgId, trip1Id,
                new Date(todayDate + 'T08:30:00'),
                new Date(todayDate + 'T08:35:00'),
                new Date(todayDate + 'T08:40:00')
            ]
        );
        console.log('Trip 1 Stops created');

        // Trip Member
        await client.query(
            `INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_signature_base64, member_status, created_at) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'COMPLETED', NOW())`,
            [orgId, trip1Id, memberAId, stop1Id, stop2Id, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==']
        );
        console.log('Trip 1 Members created');

        console.log('--- PHASE 2 COMPLETE ---');

    } catch (err) {
        console.error('Phase 2 Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedTrips();
