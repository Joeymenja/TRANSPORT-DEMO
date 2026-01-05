import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { PdfService } from './pdf.service';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { TripStop } from './entities/trip-stop.entity';
import { Vehicle } from './entities/vehicle.entity';
import { Member } from './entities/member.entity';
import { User } from './entities/user.entity';
import { VehicleMaintenance } from './entities/maintenance.entity';
import { VehicleDocument } from './entities/vehicle-document.entity';
import { Driver } from './entities/driver.entity';
import { TripReport } from './entities/trip-report.entity';
import { Signature } from './entities/signature.entity';
import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
                entities: [Trip, TripMember, TripStop, Vehicle, Member, User, VehicleMaintenance, VehicleDocument, Driver, TripReport, Signature, ActivityLog, Notification],
                synchronize: true,
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Trip, TripMember, TripStop, Vehicle, Member, User, VehicleMaintenance, VehicleDocument, Driver, TripReport, Signature, ActivityLog, Notification]),
        ScheduleModule.forRoot(),
        MulterModule.registerAsync({
            useFactory: () => ({
                storage: diskStorage({
                    destination: './uploads',
                    filename: (req, file, cb) => {
                        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                        cb(null, `${randomName}${extname(file.originalname)}`);
                    },
                }),
            }),
        }),
    ],
    controllers: [TripController, VehicleController, DriverController, ReportController, ActivityLogController, NotificationController],
    providers: [TripService, VehicleService, PdfService, DriverService, ReportService, ActivityLogService, NotificationService],
    exports: [TripService, VehicleService, ActivityLogService],
})
export class TransportModule { }
