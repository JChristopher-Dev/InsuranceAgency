// src/app/app.config.ts
//
// Angular 17 no longer uses AppModule by default.
// app.config.ts is the modern replacement — it provides all app-wide services.

import { ApplicationConfig }             from '@angular/core';
import { provideRouter }                  from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations }              from '@angular/platform-browser/animations';
import { routes }                         from './app.routes';
import { apiInterceptor }                 from './core/interceptors/api.interceptor';
import { errorInterceptor }               from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router — pass in your routes array
    provideRouter(routes),

    // HttpClient — register interceptors here using withInterceptors()
    // Order matters: apiInterceptor runs first (adds URL), then errorInterceptor (catches errors)
    provideHttpClient(
      withInterceptors([apiInterceptor, errorInterceptor])
    ),

    // Animations — required for any Angular Material or CSS transitions
    provideAnimations(),
  ]
};
