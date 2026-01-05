import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);
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
