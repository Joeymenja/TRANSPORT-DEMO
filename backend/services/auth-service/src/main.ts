import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';

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
    console.log('----------------------------------------');

    // Enable CORS
    app.enableCors({
        origin: configService.get('CORS_ORIGIN'),
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

    const port = configService.get('PORT') || 8081;
    await app.listen(port);

    console.log(`🚀 Auth Service is running on: http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/auth`);
}

bootstrap();
