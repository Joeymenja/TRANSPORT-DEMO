
async function login() {
    try {
        const response = await fetch('http://localhost:8081/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@gvbh.com', password: 'password123' })
        });

        if (!response.ok) {
            console.log('Admin login failed with password123');
        } else {
            console.log('Admin login SUCCESS with password123');
        }
    } catch (e) {
        console.error(e);
    }
}

login();
