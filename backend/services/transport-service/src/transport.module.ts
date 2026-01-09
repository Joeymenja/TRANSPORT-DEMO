import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
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
import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
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
import { Organization } from './entities/organization.entity';
import { Location } from './entities/location.entity';
import { Claim } from './entities/claim.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventsGateway } from './events.gateway';

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
                entities: [Trip, TripMember, TripStop, Vehicle, Member, User, VehicleMaintenance, VehicleDocument, Driver, TripReport, Signature, ActivityLog, Notification, Organization, Location, Claim],
                /**
                 * CRITICAL SECURITY FIX:
                 * synchronize: true auto-syncs entity changes to database schema
                 * This is DANGEROUS in production as it can cause data loss
                 *
                 * - Development: true (convenient for rapid development)
                 * - Production: false (use migrations instead)
                 *
                 * Changed from: synchronize: true (always)
                 * Changed to: Only sync when NOT in production
                 */
                synchronize: configService.get('NODE_ENV') !== 'production',
                logging: configService.get('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Trip, TripMember, TripStop, Vehicle, Member, User, VehicleMaintenance, VehicleDocument, Driver, TripReport, Signature, ActivityLog, Notification, Location, Claim]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                /**
                 * CRITICAL SECURITY FIX:
                 * JWT_SECRET must never be hardcoded or have a default value
                 *
                 * Previous code had: configService.get('JWT_SECRET') || 'hardcoded-secret'
                 * This meant if JWT_SECRET wasn't set, it would use the hardcoded value
                 * Anyone with source code could forge JWTs
                 *
                 * Now: System will FAIL FAST if JWT_SECRET is not set
                 * This forces proper configuration before deployment
                 *
                 * To fix "JWT_SECRET must be set" error:
                 * 1. Add JWT_SECRET=your-secure-random-secret to .env file
                 * 2. Generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
                 * 3. Never commit the real secret to git
                 */
                const secret = configService.get('JWT_SECRET');
                if (!secret) {
                    throw new Error('CRITICAL: JWT_SECRET environment variable must be set. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
                }
                return {
                    secret,
                    signOptions: { expiresIn: '24h' }, // Tokens expire after 24 hours
                };
            },
            inject: [ConfigService],
        }),
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
    controllers: [TripController, VehicleController, DriverController, ReportController, ActivityLogController, NotificationController, LocationController, BillingController, PayrollController],
    providers: [TripService, VehicleService, PdfService, DriverService, ReportService, ActivityLogService, NotificationService, JwtStrategy, LocationService, BillingService, PayrollService, EventsGateway],
    exports: [TripService, VehicleService, ActivityLogService, BillingService],
})
export class TransportModule { }
