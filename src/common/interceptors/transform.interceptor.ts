import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../../shared';

/**
 * Global Transform Interceptor
 * Intercepts successful controller execution streams and automatically encapsulates
 * output within our standard IApiResponse contract.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<IApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // Avoid double-wrapping if controller explicitly returns an IApiResponse structure
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data as unknown as IApiResponse<T>;
        }
        
        return {
          success: true,
          message: 'Operation executed successfully',
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
        } as IApiResponse<T>;
      }),
    );
  }
}
