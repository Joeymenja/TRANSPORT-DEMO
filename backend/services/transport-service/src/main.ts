import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransportModule } from './transport.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(TransportModule);
    const configService = app.get(ConfigService);
    console.log('----------------------------------------');
    console.log('ACTIVE DB CONFIG (Transport):');
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
    
    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = configService.get('PORT') || 8082;
    await app.listen(port);

    console.log(`🚀 Transport Service is running on: http://localhost:${port}`);
    console.log(`📚 API: http://localhost:${port}/trips`);
}

bootstrap();
