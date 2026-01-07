// using built-in fetch

async function login() {
    const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new.driver@gvbh.com', password: 'password123' })
    });

    if (!response.ok) {
        console.error('Login failed:', response.status, response.statusText);
        const text = await response.text();
        console.error('Body:', text);
        return;
    }

    const data = await response.json();
    console.log('Login Success!');
    console.log('User Object:', JSON.stringify(data.user, null, 2));
    
    // Decode token to see payload
    const token = data.accessToken;
    const parts = token.split('.');
    if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('Token Payload:', JSON.stringify(payload, null, 2));
    }
}

login();
