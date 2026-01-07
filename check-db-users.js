const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function checkUsers() {
    try {
        await client.connect();
        console.log('✅ Connected to database.\n');

        console.log('=== Checking All Users ===');
        const users = await client.query(`
            SELECT id, email, role, is_active, first_name, last_name, organization_id
            FROM users
            LIMIT 10
        `);

        console.log(`Found ${users.rows.length} users:`);
        users.rows.forEach(user => {
            console.log(`- ${user.email} (${user.role}) Org: ${user.organization_id} - ${user.first_name} ${user.last_name} [Active: ${user.is_active}]`);
        });

        console.log('\n=== Checking Drivers ===');
        const drivers = await client.query(`
            SELECT d.id, u.email, u.first_name, u.last_name, d.is_active
            FROM drivers d
            JOIN users u ON d.user_id = u.id
            LIMIT 10
        `);

        console.log(`Found ${drivers.rows.length} drivers:`);
        drivers.rows.forEach(driver => {
            console.log(`- ${driver.email} - ${driver.first_name} ${driver.last_name} [Active: ${driver.is_active}]`);
        });

        console.log('\n=== Checking Notifications ===');
        const notifications = await client.query(`
            SELECT id, type, title, status, created_at
            FROM notifications
            ORDER BY created_at DESC
            LIMIT 5
        `);

        console.log(`Found ${notifications.rows.length} notifications:`);
        notifications.rows.forEach(notif => {
            console.log(`- [${notif.status}] ${notif.type}: ${notif.title} (${notif.created_at})`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

checkUsers();
