import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Claim, ClaimStatus } from './entities/claim.entity';
import { Trip } from './entities/trip.entity';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async generateClaimsForTrips(tripIds: string[]): Promise<Claim[]> {
    this.logger.log(`Generating claims for ${tripIds.length} trips`);
    
    const trips = await this.tripRepository.find({
      where: { id: In(tripIds) },
      relations: ['tripMembers', 'assignedVehicle']
    });

    const claims: Claim[] = [];

    for (const trip of trips) {
      // Check if claim already exists
      const existing = await this.claimRepository.findOne({ where: { tripId: trip.id } });
      if (existing) {
        this.logger.warn(`Claim already exists for trip ${trip.id}`);
        continue;
      }

      // Logic to determine codes and amount would go here
      // For now, simple default creation
      const claim = this.claimRepository.create({
        tripId: trip.id,
        claimNumber: `CLM-${Date.now()}-${trip.id.substring(0, 4)}`,
        status: ClaimStatus.UNBILLED,
        procedureCode: 'A0100', // Taxi default
        billedAmount: 15.00, // Placeholder logic
      });

      claims.push(await this.claimRepository.save(claim));
    }

    return claims;
  }

  async getUnbilledClaims(): Promise<Claim[]> {
    return this.claimRepository.find({
      where: { status: ClaimStatus.UNBILLED },
      relations: ['trip']
    });
  }
}
