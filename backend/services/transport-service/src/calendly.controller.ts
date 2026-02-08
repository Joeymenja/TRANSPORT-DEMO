import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { CalendlyService } from './calendly.service';

@Controller('calendly')
export class CalendlyController {
    private readonly logger = new Logger(CalendlyController.name);

    constructor(private readonly calendlyService: CalendlyService) {}

    @Post('webhook')
    @HttpCode(200)
    async handleWebhook(@Body() payload: any) {
        this.logger.log('Receiving webhook payload');
        // Process asynchronously to return 200 quickly
        this.calendlyService.handleWebhook(payload).catch(err => {
            this.logger.error('Error processing webhook in background', err);
        });
        return { status: 'received' };
    }
}
