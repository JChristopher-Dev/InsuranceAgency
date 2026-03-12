import { HttpInterceptorFn } from '@angular/common/http';
import { environment }       from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall = !req.url.startsWith('http');
  const url       = isApiCall ? `${environment.apiUrl}/${req.url}` : req.url;

  const apiReq = req.clone({
    url,
    setHeaders: { 'Content-Type': 'application/json' }
  });

  return next(apiReq);
};