import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
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

    const port = configService.get('PORT') || 8083;
    await app.listen(port);

    console.log(`🚀 Member Service is running on: http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/members`);
}

bootstrap();
