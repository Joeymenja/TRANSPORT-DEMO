const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'gvbh_transport',
    password: 'postgres',
    port: 5432,
});

async function checkDuplicates() {
    try {
        await client.connect();
        console.log('Connected to database.\n');

        // Check for duplicate trips (same member, same date/time)
        console.log('=== Checking for Duplicate Trips ===');
        const duplicates = await client.query(`
            SELECT 
                trip_date, 
                organization_id,
                COUNT(*) as count,
                STRING_AGG(id::text, ', ') as trip_ids
            FROM trips
            WHERE trip_date > NOW() - INTERVAL '1 day'
            GROUP BY trip_date, organization_id
            HAVING COUNT(*) > 1
        `);

        if (duplicates.rows.length > 0) {
            console.log('⚠️  Found potential duplicate trips:');
            console.log(duplicates.rows);
        } else {
            console.log('✅ No duplicate trips found.');
        }

        // Check recent trips
        console.log('\n=== Recent Trips (Last 24 hours) ===');
        const recentTrips = await client.query(`
            SELECT 
                id,
                trip_date,
                status,
                mobility_requirement,
                created_at,
                (SELECT COUNT(*) FROM trip_members WHERE trip_id = trips.id) as member_count,
                (SELECT COUNT(*) FROM trip_stops WHERE trip_id = trips.id) as stop_count
            FROM trips
            WHERE created_at > NOW() - INTERVAL '24 hours'
            ORDER BY created_at DESC
            LIMIT 10
        `);

        console.log(`Found ${recentTrips.rows.length} recent trips:`);
        recentTrips.rows.forEach(trip => {
            console.log(`- Trip ${trip.id.substring(0, 8)}: ${trip.status}, ${trip.mobility_requirement}, ${trip.member_count} members, ${trip.stop_count} stops`);
        });

        // Check for orphaned trip members (members without trips)
        console.log('\n=== Checking Data Consistency ===');
        const orphanedMembers = await client.query(`
            SELECT COUNT(*) as count
            FROM trip_members tm
            LEFT JOIN trips t ON tm.trip_id = t.id
            WHERE t.id IS NULL
        `);

        if (orphanedMembers.rows[0].count > 0) {
            console.log(`⚠️  Found ${orphanedMembers.rows[0].count} orphaned trip members.`);
        } else {
            console.log('✅ No orphaned trip members.');
        }

        // Check for orphaned trip stops
        const orphanedStops = await client.query(`
            SELECT COUNT(*) as count
            FROM trip_stops ts
            LEFT JOIN trips t ON ts.trip_id = t.id
            WHERE t.id IS NULL
        `);

        if (orphanedStops.rows[0].count > 0) {
            console.log(`⚠️  Found ${orphanedStops.rows[0].count} orphaned trip stops.`);
        } else {
            console.log('✅ No orphaned trip stops.');
        }

        console.log('\n=== Consistency Check Complete ===');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkDuplicates();
