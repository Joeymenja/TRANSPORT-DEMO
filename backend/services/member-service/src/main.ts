import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Enable CORS
    // Enable CORS with dynamic origin support
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
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

    const port = configService.get('PORT') || 8083;
    await app.listen(port);

    console.log(`🚀 Member Service is running on: http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/members`);
}

bootstrap();
