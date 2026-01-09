
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception;

    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      error: message,
      stack: exception instanceof Error ? exception.stack : null,
    };

    this.logger.error('CRITICAL AUTH ERROR:', JSON.stringify(errorLog, null, 2));

    // Append to file
    try {
        const logPath = path.join(process.cwd(), 'error.log');
        fs.appendFileSync(logPath, JSON.stringify(errorLog) + '\\n');
    } catch (e) {
        console.error('Failed to write to error log', e);
    }

    response.status(status).json(errorLog);
  }
}
