import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { IApiResponse } from '../../shared';

/**
 * Global HttpException Filter
 * Intercepts uncaught exceptions and NestJS HttpExceptions, serializing them into 
 * the uniform IApiResponse architectural model.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || exception.message;
        if (Array.isArray(exceptionResponse.message)) {
          message = 'Validation failed for input data';
          errorDetails = exceptionResponse.message;
        } else {
          errorDetails = exceptionResponse.error || exceptionResponse;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled Exception on ${request.method} ${request.url}: ${exception.stack}`);
    }

    const errorResponse: IApiResponse<null> = {
      success: false,
      message,
      error: errorDetails || exception?.constructor?.name || 'UnknownError',
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
