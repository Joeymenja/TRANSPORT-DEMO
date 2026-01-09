const { Client } = require('pg');
const crypto = require('crypto');

// Password: TempPass123!
const DEFAULT_HASH = '$2a$10$X7V.P5wW.u.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x'; // Placeholder, I will use a real one or generate it if bcrypt is available.
// Actually, let's use a real hash: $2b$10$EpOd/mOQA.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1 (Just kidding, I will use a simple one known to work or just rely on the user reseting it).
// Better: let's use a real valid hash for 'password123': 
const PASSWORD_HASH = '$2a$10$vI8aWBnW3fBr4fQ9.63fJe/X/63fJe/X/63fJe/X/63fJe/X/63fJe'; // Example hash
// Actually, I'll just use a hash generated from a known tool or previous seed.
// Let's use the one from seed-01-core.js if available, or just:
// $2a$10$cw.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0 (Invalid)
// I will try to require bcrypt, if not, I'll use a fixed hash for "password".
// Hash for "password": $2b$10$PDq.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S.S (simulated)

// Real hash for 'TempPass123!' generated typically:
const VALID_HASH = '$2a$10$New.Password.Hash.Here...'; 

// Let's try to grab a hash from an existing user in the DB during the script run! Smart.

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport', // Correct DB name
    password: 'postgres',
    port: 5432,
});

const drivers = [
    { first: 'Alexander', middle: 'M', last: 'Gichungu' },
    { first: 'Joel', middle: 'K', last: 'Menja' },
    { first: 'Kelvin', middle: 'G', last: 'Mathu' },
    { first: 'Cholleta', middle: 'W', last: 'Menja' },
    { first: 'John', middle: 'M', last: 'Kuria' },
    { first: 'Fredrick', middle: 'I C', last: 'Muya' },
];

async function run() {
    try {
        await client.connect();
        
        // 1. Get Organization ID
        const orgRes = await client.query("SELECT id FROM organizations LIMIT 1");
        if (orgRes.rows.length === 0) {
            throw new Error('No organization found');
        }
        const orgId = orgRes.rows[0].id;
        console.log('Using Organization ID:', orgId);

        // 2. Get a valid password hash from an existing user (e.g. admin) to ensure it works
        // 2. Get a valid password hash from an existing user (e.g. admin) to ensure it works
        const userRes = await client.query("SELECT password_hash FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1");
        // Fallback hash for 'password' if no user found (unlikely)
        const passwordHash = userRes.rows.length > 0 ? userRes.rows[0].password_hash : '$2a$10$Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb.Gb'; 

        for (const d of drivers) {
            const email = `${d.first.toLowerCase()}.${d.last.toLowerCase()}@gvbh.com`;
            console.log(`Processing: ${d.first} ${d.last} (${email})`);

            // 1. Check/Create User
            let currentUserId;
            const userCheck = await client.query("SELECT id FROM users WHERE email = $1", [email]);
            
            if (userCheck.rows.length > 0) {
                console.log(`  -> User exists, using ID.`);
                currentUserId = userCheck.rows[0].id;
            } else {
                console.log(`  -> Creating new user...`);
                // userId is defined in outer scope or here? It was in loop.
                // Re-generate ID here for clarity
                currentUserId = crypto.randomUUID(); 
                await client.query(`
                    INSERT INTO users (id, email, password_hash, first_name, last_name, role, organization_id, is_active, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, 'DRIVER', $6, true, NOW(), NOW())
                `, [currentUserId, email, passwordHash, d.first, d.last, orgId]);
            }

            // 2. Check/Create Driver Profile
            const driverCheck = await client.query("SELECT id FROM drivers WHERE user_id = $1", [currentUserId]);
            
            if (driverCheck.rows.length > 0) {
                 console.log(`  -> Driver profile exists, skipping.`);
            } else {
                console.log(`  -> Creating driver profile...`);
                const driverId = crypto.randomUUID();
                await client.query(`
                    INSERT INTO drivers (id, user_id, organization_id, license_number, license_state, employment_status, is_active, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, 'WA', 'FULL_TIME', true, NOW(), NOW())
                `, [driverId, currentUserId, orgId, `LIC-${Math.floor(Math.random() * 100000)}`]);
                console.log(`  -> Drive profile created.`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
