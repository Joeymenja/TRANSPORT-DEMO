const { Client } = require('pg');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        
        // 1. Get dependencies
        const driverEmail = 'driver@gvbh-demo.com';
        const driverRes = await client.query(`
            SELECT d.id, d.organization_id, d.assigned_vehicle_id, u.id as user_id
            FROM drivers d 
            JOIN users u ON d.user_id = u.id
            WHERE u.email = $1
        `, [driverEmail]);

        if (driverRes.rows.length === 0) {
            console.error('Driver not found');
            return;
        }
        const { id: driverId, organization_id: orgId, assigned_vehicle_id: vehicleId, user_id: adminId } = driverRes.rows[0];

        const memberRes = await client.query("SELECT id FROM members WHERE organization_id = $1 LIMIT 3", [orgId]);
        const members = memberRes.rows;

        const today = new Date().toISOString().split('T')[0];
        console.log('Targeting date:', today);

        // 2. Create Trip 1: IN_PROGRESS (Current Mission)
        const trip1Id = uuidv4();
        await client.query(
            `INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'PICK_UP', 'IN_PROGRESS')`,
            [trip1Id, orgId, today, adminId, driverId, vehicleId]
        );

        const stop1_1Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) 
             VALUES ($1, $2, $3, 'PICKUP', 1, 'Banner University Medical Center, Phoenix', $4)`,
            [stop1_1Id, orgId, trip1Id, new Date(`${today}T08:00:00`)]
        );

        const stop1_2Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) 
             VALUES ($1, $2, $3, 'DROPOFF', 2, 'St. Joseph Hospital & Medical Center', $4)`,
            [stop1_2Id, orgId, trip1Id, new Date(`${today}T08:30:00`)]
        );

        await client.query(
            `INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_status) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'PICKED_UP')`,
            [orgId, trip1Id, members[0].id, stop1_1Id, stop1_2Id]
        );

        // 3. Create Trip 2: SCHEDULED (Next Mission)
        const trip2Id = uuidv4();
        await client.query(
            `INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'DROP_OFF', 'SCHEDULED')`,
            [trip2Id, orgId, today, adminId, driverId, vehicleId]
        );

        const stop2_1Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) 
             VALUES ($1, $2, $3, 'PICKUP', 1, 'Mayo Clinic, Phoenix', $4)`,
            [stop2_1Id, orgId, trip2Id, new Date(`${today}T10:00:00`)]
        );

        const stop2_2Id = uuidv4();
        await client.query(
            `INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) 
             VALUES ($1, $2, $3, 'DROPOFF', 2, 'Abrazo Central Campus', $4)`,
            [stop2_2Id, orgId, trip2Id, new Date(`${today}T10:45:00`)]
        );

        await client.query(
            `INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_status) 
             VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'SCHEDULED')`,
            [orgId, trip2Id, members[1].id, stop2_1Id, stop2_2Id]
        );

        console.log('Demo trips created successfully for today!');
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
