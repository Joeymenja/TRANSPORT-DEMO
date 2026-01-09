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

async function seedDrivers() {
    console.log('--- STARTING PHASE 3: DRIVERS SEEDING ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get Organization
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        if (orgRes.rows.length === 0) throw new Error('Org not found! Run Phase 1.');
        const orgId = orgRes.rows[0].id;

        // 2. Clear existing demo drivers
        console.log('Clearing existing demo drivers...');
        await client.query('DELETE FROM drivers WHERE organization_id = $1', [orgId]);

        // 3. Setup Demo Drivers
        const demoDrivers = [
            {
                email: 'driver@gvbh-demo.com',
                firstName: 'Demo',
                lastName: 'Driver',
                licenseNumber: 'DL-99999',
                licenseState: 'AZ',
                employmentStatus: 'FULL_TIME'
            },
            {
                email: 'sarah.taylor@example.com',
                firstName: 'Sarah',
                lastName: 'Taylor',
                licenseNumber: 'DL-88721',
                licenseState: 'AZ',
                employmentStatus: 'PART_TIME'
            },
            {
                email: 'mike.wilson@example.com',
                firstName: 'Mike',
                lastName: 'Wilson',
                licenseNumber: 'DL-33412',
                licenseState: 'CA',
                employmentStatus: 'CONTRACTOR'
            }
        ];

        const passwordHash = await bcrypt.hash('password123', 10);

        for (const d of demoDrivers) {
            let userId;
            // Check if user exists
            const userRes = await client.query('SELECT id FROM users WHERE email = $1', [d.email]);
            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].id;
            } else {
                userId = uuidv4();
                await client.query(
                    `INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, is_active) 
                     VALUES ($1, $2, $3, $4, $5, $6, 'DRIVER', true)`,
                    [userId, orgId, d.email, passwordHash, d.firstName, d.lastName]
                );
            }

            // Create Driver Profile
            // Ensure no existing driver profile for this user
            await client.query('DELETE FROM drivers WHERE user_id = $1', [userId]);

            const driverId = uuidv4();
            await client.query(
                `INSERT INTO drivers (
                    id, organization_id, user_id, license_number, license_state, 
                    license_expiry_date, employment_status, emergency_contact_name, 
                    emergency_contact_phone, is_active, created_at, updated_at
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())`,
                [
                    driverId, orgId, userId, d.licenseNumber, d.licenseState,
                    '2027-12-31', d.employmentStatus, 'Emergency System', '555-0000'
                ]
            );
            console.log(`Driver seeded: ${d.email}`);
        }

        console.log('--- PHASE 3 COMPLETE ---');

    } catch (err) {
        console.error('Phase 3 Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedDrivers();
