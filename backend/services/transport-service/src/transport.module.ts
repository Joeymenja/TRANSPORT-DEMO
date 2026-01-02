import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PdfService } from './pdf.service';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { TripStop } from './entities/trip-stop.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Member } from './entities/member.entity';
import { User } from './entities/user.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [Trip, TripMember, TripStop, Vehicle, Member, User],
                synchronize: false,
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Trip, TripMember, TripStop, Vehicle, Member, User]),
        ScheduleModule.forRoot(),
    ],
    controllers: [TripController, VehicleController],
    providers: [TripService, VehicleService, PdfService],
    exports: [TripService, VehicleService],
})
export class TransportModule { }
