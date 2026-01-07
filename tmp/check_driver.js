const { Client } = require('pg');
(async () => {
  const client = new Client({ user: 'postgres', host: 'localhost', database: 'gvbh_transport', password: 'postgres' });
  await client.connect();
  const res = await client.query("SELECT id, default_vehicle_id FROM users WHERE email='new.driver@gvbh.com'");
  console.log('User:', res.rows[0]);
  const driverRes = await client.query('SELECT d.id FROM drivers d JOIN users u ON d.user_id = u.id WHERE u.email = $1', ['new.driver@gvbh.com']);
  console.log('Driver profile:', driverRes.rows[0]);
  await client.end();
})();
