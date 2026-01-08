
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport',
};

const gvbhLocations = [
    { name: 'Latona House', address: '6338 W Latona Road, Laveen, AZ 85339', type: 'HOME' },
    { name: 'Carter House', address: '3255 W Carter Road, Phoenix, AZ 85041', type: 'HOME' },
    { name: 'Carmen House', address: '1550 W Carmen Street, Phoenix, AZ 85041', type: 'HOME' },
    { name: 'Walatowa House', address: '5420 W Walatowa Street, Laveen, AZ 85339', type: 'HOME' },
    { name: 'Clover', address: '5610 W Hardtack Trl, Laveen, AZ 85339', type: 'HOME' },
    { name: 'StarLight', address: '3921 S 97th Ave, Tolleson, AZ 85353', type: 'HOME' },
    { name: 'Paseo', address: '5533 W Paseo Way, Laveen, AZ 85339', type: 'HOME' },
];

async function seedLocations() {
    console.log('--- SEEDING GVBH LOCATIONS ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        // 1. Get Organization
        const orgRes = await client.query("SELECT id FROM organizations WHERE subdomain = 'gvbh-demo'");
        if (orgRes.rows.length === 0) {
            throw new Error('Organization not found. Run core seed first.');
        }
        const orgId = orgRes.rows[0].id;

        // 1.5 Ensure Table Exists (Migration)
        await client.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                address TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'HOME',
                organization_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check for location_type column and rename type if needed or add it
        // The error said "location_type" does not exist, but my SQL uses "type". 
        // Wait, the seed script used: VALUES (..., loc.type) but the INSERT statement in seed-locations.js was:
        // INSERT INTO locations (..., location_type, ...)
        // The SQL file has "type", but the seed script tried "location_type".
        // Let's align them. The Entity in backend probably uses "type" or "locationType".
        // I will check the Entity definition if possible, but for now I will stick to what the SQL file defined: "type".
        
        // Actually, looking at the previous error: error: column "location_type" of relation "locations" does not exist
        // My previous seed-locations.js had: `INSERT INTO locations (..., location_type, ...)`.
        // The SQL file has `type VARCHAR(50)`.
        // So I should change `location_type` to `type` in the INSERT statement in seed-locations.js.
        
        // 2. Insert Locations
        for (const loc of gvbhLocations) {
            // Check if exists
            const check = await client.query('SELECT id FROM locations WHERE name = $1 AND organization_id = $2', [loc.name, orgId]);
            if (check.rows.length === 0) {
                await client.query(
                    `INSERT INTO locations (id, organization_id, name, address, type) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [uuidv4(), orgId, loc.name, loc.address, loc.type]
                );
                console.log(`Added: ${loc.name}`);
            } else {
                console.log(`Skipped (Exists): ${loc.name}`);
            }
        }
        console.log('--- LOCATIONS SEEDED ---');

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedLocations();
