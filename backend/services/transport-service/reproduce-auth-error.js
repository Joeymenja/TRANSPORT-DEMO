const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport', // Verified this is what auth-service uses
    password: 'postgres',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to gvbh_transport');

        const sql = `
SELECT "User"."id" AS "User_id", "User"."organization_id" AS "User_organization_id", "User"."email" AS "User_email", "User"."password_hash" AS "User_password_hash", "User"."first_name" AS "User_first_name", "User"."last_name" AS "User_last_name", "User"."role" AS "User_role", "User"."phone" AS "User_phone", "User"."profile_photo_url" AS "User_profile_photo_url", "User"."dob" AS "User_dob", "User"."address_street" AS "User_address_street", "User"."address_unit" AS "User_address_unit", "User"."address_city" AS "User_address_city", "User"."address_state" AS "User_address_state", "User"."address_zip" AS "User_address_zip", "User"."emergency_contact_name" AS "User_emergency_contact_name", "User"."emergency_contact_phone" AS "User_emergency_contact_phone", "User"."emergency_contact_relationship" AS "User_emergency_contact_relationship", "User"."default_vehicle_id" AS "User_default_vehicle_id", "User"."is_active" AS "User_is_active", "User"."onboarding_step" AS "User_onboarding_step", "User"."created_at" AS "User_created_at", "User"."updated_at" AS "User_updated_at" 
FROM "users" "User" 
WHERE (("User"."email" = $1)) 
LIMIT 1
`;
        const values = ["test.driver.4@example.com"];

        console.log('Executing query...');
        const res = await client.query(sql, values);
        console.log('Query successful. Row count:', res.rowCount);
        if (res.rowCount > 0) console.log('Found user:', res.rows[0]);

    } catch (err) {
        console.error('Query FAILED:', err.message);
    } finally {
        await client.end();
    }
}

run();
