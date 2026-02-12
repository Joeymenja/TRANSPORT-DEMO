import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);

    // Critical Environment Validation
    const requiredEnv = ['JWT_SECRET', 'DB_PASSWORD', 'DB_HOST', 'DB_DATABASE'];
    const missingEnv = requiredEnv.filter(env => !configService.get(env));

    if (missingEnv.length > 0) {
        console.error('----------------------------------------');
        console.error('CRITICAL ERROR: Missing Environment Variables');
        console.error(`Missing: ${missingEnv.join(', ')}`);
        console.error('The application cannot start without these variables.');
        console.error('----------------------------------------');
        process.exit(1);
    }

    console.log('----------------------------------------');
    console.log('ACTIVE DB CONFIG:');
    console.log('HOST:', configService.get('DB_HOST'));
    console.log('DATABASE:', configService.get('DB_DATABASE'));
    console.log('USERNAME:', configService.get('DB_USERNAME'));

    const jwtSecret = configService.get('JWT_SECRET');
    console.log('JWT SECRET (Masked):', jwtSecret ? `${jwtSecret.substring(0, 5)}...` : 'NOT SET');
    console.log('----------------------------------------');

    // Enable CORS
    // Enable CORS with dynamic origin support
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // In development, refrain from strict origin checks to allow local network access (e.g. phone)
            if (configService.get('NODE_ENV') === 'development') {
                return callback(null, true);
            }

            const allowedOrigins = configService.get('CORS_ORIGIN').split(',');
            if (allowedOrigins.indexOf(origin) !== -1 || configService.get('CORS_ORIGIN') === '*') {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = configService.get('PORT') || 8081;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Auth Service is running on: http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/auth`);
}

bootstrap();
