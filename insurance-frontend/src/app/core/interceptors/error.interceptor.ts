// src/app/core/interceptors/error.interceptor.ts
//
// Catches all HTTP errors in one place so every service doesn't need
// its own try/catch. Transforms raw HttpErrorResponse into a friendly message.

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError }               from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        // Network error — API is unreachable
        message = 'Cannot reach the server. Check your API is running.';
      } else if (error.status === 400) {
        // Backend validation error — use the backend's message
        message = error.error?.message ?? 'Invalid request.';
      } else if (error.status === 404) {
        message = error.error?.message ?? 'Resource not found.';
      } else if (error.status === 409) {
        message = error.error?.message ?? 'Conflict — record already exists.';
      } else if (error.status === 500) {
        message = 'Server error. Please try again later.';
      }

      console.error(`[HTTP ${error.status}]`, message, error);

      // throwError re-throws so subscribers can still handle it if they want
      return throwError(() => new Error(message));
    })
  );
};
