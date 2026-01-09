import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('generate')
  async generateClaims(@Body() body: { tripIds: string[] }) {
    return this.billingService.generateClaimsForTrips(body.tripIds);
  }

  @Get('unbilled')
  async getUnbilled() {
    return this.billingService.getUnbilledClaims();
  }
}
