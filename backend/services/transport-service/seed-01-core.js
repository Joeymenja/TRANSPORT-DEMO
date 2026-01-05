const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

async function seedCore() {
    console.log('--- STARTING PHASE 1: CORE SEEDING ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get or Create Organization
        let orgId;
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        if (orgRes.rows.length > 0) {
            orgId = orgRes.rows[0].id;
        } else {
            orgId = uuidv4();
            await client.query(
                `INSERT INTO organizations (id, name, subdomain, is_active) 
                 VALUES ($1, 'Great Values Transportation', 'gvbh-demo', true)`,
                [orgId]
            );
        }
        console.log('Organization verified:', orgId);

        // 2. Clear existing demo data
        console.log('Clearing existing demo data...');
        await client.query('DELETE FROM trip_members WHERE organization_id = $1', [orgId]);
        await client.query('DELETE FROM trip_stops WHERE organization_id = $1', [orgId]);
        await client.query('DELETE FROM trips WHERE organization_id = $1', [orgId]);
        await client.query('DELETE FROM members WHERE organization_id = $1', [orgId]);
        await client.query('DELETE FROM vehicles WHERE organization_id = $1', [orgId]);
        console.log('Existing demo data cleared');

        // 3. Get or Create Users
        let adminId, driverId;

        // Admin
        const adminRes = await client.query("SELECT id FROM users WHERE email = 'admin@gvbh-demo.com'");
        if (adminRes.rows.length > 0) {
            adminId = adminRes.rows[0].id;
        } else {
            adminId = uuidv4();
            const passwordHash = await bcrypt.hash('password123', 10);
            await client.query(
                `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_active) 
                 VALUES ($1, $2, 'admin@gvbh-demo.com', $3, 'Demo', 'Admin', 'ORG_ADMIN', true)`,
                [adminId, orgId, passwordHash]
            );
        }

        // Driver
        const driverRes = await client.query("SELECT id FROM users WHERE email = 'driver@gvbh-demo.com'");
        if (driverRes.rows.length > 0) {
            driverId = driverRes.rows[0].id;
        } else {
            driverId = uuidv4();
            const passwordHash = await bcrypt.hash('password123', 10);
            await client.query(
                `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_active) 
                 VALUES ($1, $2, 'driver@gvbh-demo.com', $3, 'Demo', 'Driver', 'DRIVER', true)`,
                [driverId, orgId, passwordHash]
            );
        }
        console.log('Users verified');

        // 4. Create Members
        const prefix = '001'; // Fixed prefix for deterministic lookup in Phase 2 if needed, 
        // or just rely on 'DEMO-' query
        const member1Id = uuidv4();
        const member2Id = uuidv4();

        await client.query(
            `INSERT INTO members (id, organization_id, member_id, first_name, last_name, date_of_birth, is_active) 
             VALUES ($1, $2, $3, 'John', 'Doe', '1955-05-15', true)`,
            [member1Id, orgId, `DEMO-A-${prefix}`]
        );

        await client.query(
            `INSERT INTO members (id, organization_id, member_id, first_name, last_name, date_of_birth, is_active) 
             VALUES ($1, $2, $3, 'Jane', 'Smith', '1962-10-22', true)`,
            [member2Id, orgId, `DEMO-B-${prefix}`]
        );
        console.log('Members seeded');

        // 5. Create Vehicles
        const vehicle1Id = uuidv4();
        await client.query(
            `INSERT INTO vehicles (id, organization_id, vehicle_number, make, model, year, license_plate, is_active) 
             VALUES ($1, $2, $3, 'Ford', 'Transit', 2022, $4, true)`,
            [vehicle1Id, orgId, `V-${prefix}`, `DEMO-${prefix}`]
        );
        console.log('Vehicles seeded');
        console.log('--- PHASE 1 COMPLETE ---');

    } catch (err) {
        console.error('Phase 1 Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedCore();
