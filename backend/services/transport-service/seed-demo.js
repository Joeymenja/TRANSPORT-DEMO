const { execSync } = require('child_process');

try {
    console.log('Starting Demo Data Seeding...');

    execSync('node seed-01-core.js', { stdio: 'inherit', cwd: __dirname });
    execSync('node seed-03-drivers.js', { stdio: 'inherit', cwd: __dirname });
    execSync('node seed-02-trips.js', { stdio: 'inherit', cwd: __dirname });

    console.log('Seeding Completed Successfully!');
} catch (err) {
    console.error('Seeding Failed!');
    process.exit(1);
}
