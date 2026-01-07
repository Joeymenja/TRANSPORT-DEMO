/* Script to login as driver and create a demo trip using built-in fetch */
(async () => {
  // Login as the driver
  const loginRes = await fetch('http://localhost:8081/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'new.driver@gvbh.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login response:', loginData);
  const token = loginData?.accessToken || loginData?.token;
  if (!token) { console.error('No token received'); return; }

  // Use a real member ID from the database (replace with an existing member)
  const memberId = '2e087456-7b4d-495e-987e-b47104e52bb9';

  const today = new Date();
  const pickupTime = new Date();
  pickupTime.setMinutes(pickupTime.getMinutes() + 30);

  const tripPayload = {
    tripDate: today,
    // Use the actual Driver ID, not User ID
    assignedDriverId: 'f51cf355-f20b-44f6-8d52-e23a6cfb811e',
    tripType: 'PICK_UP',
    members: [{ memberId }],
    stops: [
      { stopType: 'PICKUP', stopOrder: 1, address: '1 Main St, Mesa, AZ 85201', scheduledTime: pickupTime },
      { stopType: 'DROPOFF', stopOrder: 2, address: 'Phoenix Sky Harbor, Phoenix, AZ 85034', scheduledTime: new Date(pickupTime.getTime() + 3600000) }
    ]
  };

  const createRes = await fetch('http://localhost:3003/trips', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${token}`,
      'x-organization-id': loginData.user?.organizationId || loginData.organizationId,
      'x-user-id': loginData.user?.id || loginData.id
    },
    body: JSON.stringify(tripPayload)
  });
  const createData = await createRes.json();
  console.log('Create trip response:', createData);
})();
