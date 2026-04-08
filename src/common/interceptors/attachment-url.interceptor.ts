import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function transformImageUrls(data: any, baseUrl: string): any {
  if (Array.isArray(data)) {
    return data.map((item) => transformImageUrls(item, baseUrl));
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (data && typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      if (key === 'image' && typeof data[key] === 'string' && data[key]) {
        result[key] = `${baseUrl}/${data[key]}`;
      } else {
        result[key] = transformImageUrls(data[key], baseUrl);
      }
    }
    return result;
  }
  return data;
}

@Injectable()
export class AttachmentUrlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return next.handle().pipe(map((data) => transformImageUrls(data, baseUrl)));
  }
}
