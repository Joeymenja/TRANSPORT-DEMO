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
        
        const driverEmail = 'alexander.gichungu@gvbh.com';
        
        // 1. Get Driver and User info
        const driverRes = await client.query(`
            SELECT d.id as driver_id, u.id as user_id, d.organization_id 
            FROM drivers d 
            JOIN users u ON d.user_id = u.id 
            WHERE u.email = $1
        `, [driverEmail]);

        if (driverRes.rows.length === 0) {
            console.error('Driver not found');
            return;
        }
        const { driver_id: driverId, user_id: userId, organization_id: orgId } = driverRes.rows[0];

        // 2. Ensure driver has a vehicle
        let vehicleId;
        const vehicleRes = await client.query("SELECT id FROM vehicles WHERE organization_id = $1 LIMIT 1", [orgId]);
        if (vehicleRes.rows.length > 0) {
            vehicleId = vehicleRes.rows[0].id;
            await client.query("UPDATE drivers SET assigned_vehicle_id = $1 WHERE id = $2", [vehicleId, driverId]);
            await client.query("UPDATE users SET default_vehicle_id = $1 WHERE id = $2", [vehicleId, userId]);
            console.log('Vehicle assigned:', vehicleId);
        } else {
            console.error('No vehicle found for organization');
            return;
        }

        // 3. Clear existing demo trips for this driver to avoid clutter
        // (Optional, but good for a clean demo)
        // await client.query("DELETE FROM trip_members WHERE trip_id IN (SELECT id FROM trips WHERE assigned_driver_id = $1)", [driverId]);
        // await client.query("DELETE FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE assigned_driver_id = $1)", [driverId]);
        // await client.query("DELETE FROM trips WHERE assigned_driver_id = $1", [driverId]);

        const today = new Date().toISOString().split('T')[0];
        const membersRes = await client.query("SELECT id, first_name, last_name FROM members WHERE organization_id = $1 LIMIT 5", [orgId]);
        const members = membersRes.rows;

        if (members.length < 3) {
            console.error('Not enough members in org');
            return;
        }

        // TRIP 1: COMPLETED (Early morning)
        const trip1Id = uuidv4();
        await client.query(
            "INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) VALUES ($1, $2, $3, $4, $5, $6, 'PICK_UP', 'COMPLETED')",
            [trip1Id, orgId, today, userId, driverId, vehicleId]
        );
        const s1_1 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time, actual_arrival_time) VALUES ($1, $2, $3, 'PICKUP', 1, '101 Home Ave, Phoenix', $4, $5)", [s1_1, orgId, trip1Id, new Date(`${today}T06:00:00`), new Date(`${today}T06:05:00`)]);
        const s1_2 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time, actual_arrival_time) VALUES ($1, $2, $3, 'DROPOFF', 2, 'Dialysis Center, Phoenix', $4, $5)", [s1_2, orgId, trip1Id, new Date(`${today}T06:30:00`), new Date(`${today}T06:35:00`)]);
        await client.query("INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'COMPLETED')", [orgId, trip1Id, members[0].id, s1_1, s1_2]);

        // TRIP 2: IN_PROGRESS (Current mission)
        const trip2Id = uuidv4();
        await client.query(
            "INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) VALUES ($1, $2, $3, $4, $5, $6, 'PICK_UP', 'IN_PROGRESS')",
            [trip2Id, orgId, today, userId, driverId, vehicleId]
        );
        const s2_1 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time, actual_arrival_time) VALUES ($1, $2, $3, 'PICKUP', 1, '789 Apartment Cir, Glendale', $4, $5)", [s2_1, orgId, trip2Id, new Date(`${today}T08:00:00`), new Date(`${today}T08:02:00`)]);
        const s2_2 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) VALUES ($1, $2, $3, 'DROPOFF', 2, 'Phoenix Childrens Hospital', $4)", [s2_2, orgId, trip2Id, new Date(`${today}T08:45:00`)]);
        await client.query("INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'PICKED_UP')", [orgId, trip2Id, members[1].id, s2_1, s2_2]);

        // TRIP 3: SCHEDULED (Upcoming)
        const trip3Id = uuidv4();
        await client.query(
            "INSERT INTO trips (id, organization_id, trip_date, created_by_id, assigned_driver_id, assigned_vehicle_id, trip_type, status) VALUES ($1, $2, $3, $4, $5, $6, 'DROP_OFF', 'SCHEDULED')",
            [trip3Id, orgId, today, userId, driverId, vehicleId]
        );
        const s3_1 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) VALUES ($1, $2, $3, 'PICKUP', 1, '456 Senior Living Way, Scottsdale', $4)", [s3_1, orgId, trip3Id, new Date(`${today}T11:00:00`)]);
        const s3_2 = uuidv4();
        await client.query("INSERT INTO trip_stops (id, organization_id, trip_id, stop_type, stop_order, address, scheduled_time) VALUES ($1, $2, $3, 'DROPOFF', 2, 'HonorHealth Scottsdale', $4)", [s3_2, orgId, trip3Id, new Date(`${today}T11:30:00`)]);
        await client.query("INSERT INTO trip_members (id, organization_id, trip_id, member_id, pickup_stop_id, dropoff_stop_id, member_status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'SCHEDULED')", [orgId, trip3Id, members[2].id, s3_1, s3_2]);

        console.log('PERFECT DEMO SET UP for Alexander!');
        console.log('Login Email: alexander.gichungu@gvbh.com');
        console.log('Password: password123 (Standard seed)');
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
