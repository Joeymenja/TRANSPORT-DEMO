
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Trip, TripStatus } from './entities/trip.entity';
import { TripReport } from './entities/trip-report.entity';
import { Driver } from './entities/driver.entity';
import { User } from './entities/user.entity';

export interface PayrollSummary {
    driverId: string;
    driverName: string;
    tripCount: number;
    totalMiles: number;
    totalHours: number;
    cancellationCount: number;
    estimatedPayout: number;
}

export interface PayrollDetail {
    tripId: string;
    date: Date;
    type: string;
    miles: number;
    hours: number;
    status: string;
    payout: number;
}

@Injectable()
export class PayrollService {
    // Mock Rates
    private readonly RATE_PER_MILE = 0.50;
    private readonly RATE_PER_HOUR = 15.00;
    private readonly CANCELLATION_FEE = 10.00; // Paid to driver if late cancel

    constructor(
        @InjectRepository(Trip)
        private readonly tripRepository: Repository<Trip>,
        @InjectRepository(Driver)
        private readonly driverRepository: Repository<Driver>,
    ) {}

    async getPayrollSummary(organizationId: string, startDate: Date, endDate: Date): Promise<PayrollSummary[]> {
        // 1. Get all drivers
        const drivers = await this.driverRepository.find({
            where: { organizationId },
            relations: ['user']
        });

        const summary: PayrollSummary[] = [];

        for (const driver of drivers) {
            // 2. Get trips for each driver in range
            const trips = await this.tripRepository.find({
                where: {
                    assignedDriverId: driver.id,
                    organizationId,
                    tripDate: Between(startDate, endDate)
                },
                relations: ['tripReports']
            });

            let tripCount = 0;
            let totalMiles = 0;
            let totalHours = 0;
            let cancellationCount = 0;
            let estimatedPayout = 0;

            for (const trip of trips) {
                if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.FINALIZED) {
                    tripCount++;
                    // Use report data if available
                    const report = trip.tripReports?.[0]; // Assuming 1 active report for simplicity
                    if (report) {
                        const miles = Number(report.totalMiles) || 0;
                        totalMiles += miles;
                        estimatedPayout += miles * this.RATE_PER_MILE;

                        if (report.pickupTime && report.dropoffTime) {
                            const durationMs = new Date(report.dropoffTime).getTime() - new Date(report.pickupTime).getTime();
                            const hours = durationMs / (1000 * 60 * 60);
                            if (hours > 0) {
                                totalHours += hours;
                                estimatedPayout += hours * this.RATE_PER_HOUR;
                            }
                        }
                    } else {
                        // Fallback estimates if no report (shouldn't happen for completed trips)
                        estimatedPayout += 10; // Base rate
                    }
                } else if (trip.status === TripStatus.CANCELLED || trip.status === TripStatus.NO_SHOW) {
                    // Check logic for paying cancellations?
                    // For now, let's assume NO PAY unless specific logic
                    cancellationCount++;
                }
            }

            summary.push({
                driverId: driver.id,
                driverName: driver.user ? `${driver.user.firstName} ${driver.user.lastName}` : 'Unknown Driver',
                tripCount,
                totalMiles: parseFloat(totalMiles.toFixed(1)),
                totalHours: parseFloat(totalHours.toFixed(1)),
                cancellationCount,
                estimatedPayout: parseFloat(estimatedPayout.toFixed(2))
            });
        }

        return summary;
    }

    async getDriverPayrollDetail(driverId: string, organizationId: string, startDate: Date, endDate: Date): Promise<PayrollDetail[]> {
        const trips = await this.tripRepository.find({
            where: {
                assignedDriverId: driverId,
                organizationId,
                tripDate: Between(startDate, endDate)
            },
            relations: ['tripReports'],
            order: { tripDate: 'ASC' }
        });

        return trips.map(trip => {
            let miles = 0;
            let hours = 0;
            let payout = 0;

            if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.FINALIZED) {
                const report = trip.tripReports?.[0];
                if (report) {
                    miles = Number(report.totalMiles) || 0;
                    payout += miles * this.RATE_PER_MILE;

                    if (report.pickupTime && report.dropoffTime) {
                        const durationMs = new Date(report.dropoffTime).getTime() - new Date(report.pickupTime).getTime();
                        hours = durationMs / (1000 * 60 * 60);
                        if (hours > 0) payout += hours * this.RATE_PER_HOUR;
                    }
                } else {
                    payout += 10;
                }
            }

            return {
                tripId: trip.id,
                date: trip.tripDate,
                type: trip.tripType,
                miles: parseFloat(miles.toFixed(1)),
                hours: parseFloat(hours.toFixed(1)),
                status: trip.status,
                payout: parseFloat(payout.toFixed(2))
            };
        });
    }
}
