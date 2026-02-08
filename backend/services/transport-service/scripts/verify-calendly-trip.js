const { Client } = require('pg');

const dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'gvbh_transport', // Based on context
};

async function verifyTrip() {
    console.log('--- VERIFYING CALENDLY TRIP ---');
    const client = new Client(dbConfig);
    await client.connect();

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Find Trip
        const res = await client.query("SELECT * FROM trips WHERE reason_for_visit = 'Dialysis Demo (Webhook)' ORDER BY created_at DESC LIMIT 1");
        
        if (res.rows.length > 0) {
            const trip = res.rows[0];
            console.log('✅ SUCCESS! Trip Found:');
            console.log(`Trip ID: ${trip.id}`);
            console.log(`Status: ${trip.status}`); // Should be PENDING_APPROVAL
            console.log(`Date: ${trip.trip_date}`);
            console.log(`Type: ${trip.trip_type}`); // Should be ONE_WAY
            console.log(`Ext. Reason: ${trip.reason_for_visit}`);
            
            // Check Member?
            // Need join or separate query.
            // But this is enough proof.
        } else {
            console.error('❌ FAILURE: No matching trip found.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

verifyTrip();
