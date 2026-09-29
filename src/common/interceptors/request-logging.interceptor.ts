import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          void this.saveLog(
            request,
            response.statusCode,
            Date.now() - startTime,
          );
        },

        error: (error) => {
          void this.saveLog(
            request,
            error?.status || 500,
            Date.now() - startTime,
          );
        },
      }),
    );
  }

  private async saveLog(
    request: any,
    statusCode: number,
    durationMs: number,
  ) {
    try {
      await this.prisma.apiUsageLog.create({
        data: {
          userId: request.user?.sub || null,
          action: `${request.method} ${request.route?.path || request.url}`,
          method: request.method,
          path: request.originalUrl || request.url,
          status: statusCode >= 400 ? 'FAILED' : 'SUCCESS',
          statusCode,
          durationMs,
        },
      });
    } catch (error) {
      console.error('Request logging failed:', error);
    }
  }
}