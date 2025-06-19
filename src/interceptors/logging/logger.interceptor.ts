import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestId = randomUUID();
    const date = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const userAgent = request.get('user-agent') || '';
    const forwardedFor = request.get('x-forwarded-for') || '';
    const xRealIp = request.get('x-real-ip') || '';
    const xIp = request.get('x-ip') || '';
    const ip = request.ip;
    const method = request.method;
    const url = request.path;
    const query = request.query;
    const body = request.body as unknown as Record<string, unknown>;

    this.logger.debug('---');
    this.logger.debug(`${requestId}: Incoming Request`);
    this.logger.debug(`${requestId}: ${method.toUpperCase()} ${url}`);
    this.logger.debug(`${requestId}: User Agent: ${userAgent}`);
    this.logger.debug(`${requestId}: IP: ${ip}`);
    if (forwardedFor) {
      this.logger.debug(`${requestId}: Forwarded For: ${forwardedFor}`);
    }
    if (xRealIp) {
      this.logger.debug(`${requestId}: X-Real-IP: ${xRealIp}`);
    }
    if (xIp) {
      this.logger.debug(`${requestId}: X-IP: ${xIp}`);
    }
    this.logger.debug(
      `${requestId}: Invoking ${context.getClass().name}.${context.getHandler().name}`,
    );

    if (query && !!Object.keys(query).length) {
      this.logger.debug(`${requestId}: Query params:`, query);
    }

    if (body && !!Object.keys(body).length) {
      this.logger.debug(`${requestId}: Request body:`, body);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;

          this.logger.debug('---');
          this.logger.debug(`${requestId}: Outgoing Response`);
          this.logger.debug(
            `${requestId}: Response status code: ${statusCode}`,
          );
          this.logger.debug(`${requestId}: Response:`, data);
          this.logger.debug(
            `${requestId}: Response time: ${Date.now() - date}ms`,
          );
          this.logger.debug('---');
        },
        error: (error) => {
          this.logger.error(`${requestId}: Error:`, error);
        },
      }),
    );
  }
}
