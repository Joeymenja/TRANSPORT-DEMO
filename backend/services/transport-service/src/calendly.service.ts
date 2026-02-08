import { Injectable, Logger } from '@nestjs/common';
import { TripService } from './trip.service';
import { MemberService } from './member.service';
import { OrganizationService } from './organization.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { TripStatus, TripType, MobilityRequirement } from './entities/trip.entity';

import * as fs from 'fs';
import * as path from 'path';

// Helper for debug logging
function logDebug(message: string, data?: any) {
    const logPath = path.join(process.cwd(), 'debug-calendly.log');
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(logPath, logMsg);
}

@Injectable()
export class CalendlyService {
    private readonly logger = new Logger(CalendlyService.name);

    constructor(
        private readonly tripService: TripService,
        private readonly memberService: MemberService,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
    ) {}

    async handleWebhook(payload: any) {
        logDebug('Received Payload', payload);
        this.logger.log('Received Calendly Webhook', payload);
        
        // Basic signature verification could go here (SKIP for MVP)
        // Check event type
        if (payload.event === 'invitee.created') {
             await this.createTripFromInvitee(payload.payload);
        } else {
            logDebug('Ignored Event', payload.event);
            this.logger.log(`Ignoring event type: ${payload.event}`);
        }
    }

    private async createTripFromInvitee(data: any) {
         try {
             logDebug('Processing Invitee', data);
             // 1. Get Organization
             const orgs = await this.organizationRepository.find({ where: { subdomain: 'gvbh-demo' } });
             const org = orgs[0];
             
             if (!org) {
                 logDebug('No Organization Found');
                 this.logger.error('No organization found. Cannot create trip.');
                 return;
             }
             const orgId = org.id;
             logDebug('Found Org', { id: orgId });

             // 2. Parse Data
             const email = data.email;
             logDebug('Looking up email', email);
             
             const member = await this.memberService.findByEmail(email, orgId);
             
             if (member) {
                 logDebug('Found Member', { id: member.id });
             } else {
                 logDebug('Member NOT Found', email);
                 this.logger.warn(`Member not found for email ${email}.`);
                 return;
             }
             
             // Continue...
             const startTime = new Date(data.scheduled_event.start_time);
             const endTime = new Date(data.scheduled_event.end_time);
             
             const tripData: any = {
                tripDate: startTime,
                status: 'PENDING_APPROVAL', 
                tripType: 'ONE_WAY',
                members: [{ memberId: member.id }],
                reasonForVisit: "Dialysis Demo (Webhook)",
                mobilityRequirement: member.mobilityRequirement || 'AMBULATORY',
                assignedVehicleId: null,
                assignedDriverId: null,
                stops: [
                    {
                        stopType: 'PICKUP',
                        stopOrder: 1,
                        address: member.address || '123 Test St',
                        scheduledTime: startTime,
                    },
                    {
                        stopType: 'DROPOFF',
                        stopOrder: 2,
                        address: 'Clinic',
                        scheduledTime: endTime,
                    }
                ]
             };
             
             logDebug('Creating Trip', tripData);
             const userId = 'system-calendly';
             const trip = await this.tripService.createTrip(tripData, orgId, userId);
             logDebug('Trip Created', { id: trip.id });

         } catch (error) {
             const err = error as Error;
             logDebug('Error', { message: err.message, stack: err.stack });
             this.logger.error('Failed to create trip from Calendly webhook', error);
         }
    }
}
