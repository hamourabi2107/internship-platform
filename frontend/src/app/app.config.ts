import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { timeout } from 'rxjs';
import { routes } from './app.routes';

const requestTimeoutInterceptor: HttpInterceptorFn = (request, next) => next(request).pipe(timeout({ first: 10000 }));

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([requestTimeoutInterceptor]))
  ]
};
