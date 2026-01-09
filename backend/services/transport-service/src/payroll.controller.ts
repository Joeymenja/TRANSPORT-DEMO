
import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { PayrollService, PayrollSummary, PayrollDetail } from './payroll.service';

@Controller('payroll')
export class PayrollController {
    constructor(private readonly payrollService: PayrollService) {}

    @Get('summary')
    async getSummary(
        @Headers('x-organization-id') organizationId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<PayrollSummary[]> {
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // Default 1st of month
        const end = endDate ? new Date(endDate) : new Date(); // Default today
        
        return this.payrollService.getPayrollSummary(organizationId, start, end);
    }

    @Get('driver/:driverId')
    async getDriverDetail(
        @Param('driverId') driverId: string,
        @Headers('x-organization-id') organizationId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<PayrollDetail[]> {
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        const end = endDate ? new Date(endDate) : new Date();

        return this.payrollService.getDriverPayrollDetail(driverId, organizationId, start, end);
    }
}
