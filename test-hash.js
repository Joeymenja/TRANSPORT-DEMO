const bcrypt = require('bcryptjs');

const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const pass = 'password123';

async function verify() {
    console.log('Testing hash:', hash);
    console.log('Testing pass:', pass);
    const valid = await bcrypt.compare(pass, hash);
    console.log('Valid?', valid);
    
    const newHash = await bcrypt.hash(pass, 10);
    console.log('New generated hash:', newHash);
    const newValid = await bcrypt.compare(pass, newHash);
    console.log('New hash valid?', newValid);
}

verify();
