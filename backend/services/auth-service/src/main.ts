import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);
    const configService = app.get(ConfigService);

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
