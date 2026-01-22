import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gvbh_transport',
});

async function run() {
    await dataSource.initialize();
    console.log('Database connected');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        console.log('Restoring license columns to users table...');
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_number" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_state" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_expiry" character varying`);
        
        console.log('Columns restored.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await queryRunner.release();
        await dataSource.destroy();
    }
}
run();
