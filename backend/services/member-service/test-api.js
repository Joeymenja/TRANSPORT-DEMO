const http = require('http');

const data = JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    memberId: 'TEST-123',
    dateOfBirth: '1990-01-01',
    mobilityRequirement: 'AMBULATORY',
    reportType: 'NATIVE'
});

const options = {
    hostname: 'localhost',
    port: 8083,
    path: '/members',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'x-organization-id': 'org-123' // Mock org ID
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
