import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const router = inject(Router);

    // ==================================================
    // GET TOKEN
    // ==================================================

    // Check all possible token keys used by the app.
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');

    // ==================================================
    // NO TOKEN
    // ==================================================

    if (!token) {
      console.warn(
        'AuthInterceptor: No authentication token found.'
      );

      return next(req);
    }

    // ==================================================
    // ADD JWT TOKEN
    // ==================================================

    // Prevent "Bearer Bearer ..." if the stored value
    // already contains the Bearer prefix.
    const authorizationToken =
      token.startsWith('Bearer ')
        ? token
        : `Bearer ${token}`;

    const authRequest =
      req.clone({
        setHeaders: {
          Authorization: authorizationToken
        }
      });

    // ==================================================
    // SEND REQUEST
    // ==================================================

    return next(
      authRequest
    ).pipe(
      catchError(
        (
          error: HttpErrorResponse
        ) => {

          // ==================================================
          // TOKEN EXPIRED / INVALID
          // ==================================================

          if (
            error.status === 401
          ) {

            console.warn(
              'Authentication expired. Redirecting to login.'
            );

            // ==================================================
            // REMOVE AUTH DATA
            // ==================================================

            localStorage.removeItem(
              'token'
            );

            localStorage.removeItem(
              'authToken'
            );

            localStorage.removeItem(
              'accessToken'
            );

            localStorage.removeItem(
              'user'
            );

            localStorage.removeItem(
              'admin'
            );

            localStorage.removeItem(
              'isLoggedIn'
            );

            sessionStorage.clear();

            // ==================================================
            // LOGIN
            // ==================================================

            router.navigate(
              ['/login'],
              {
                replaceUrl: true
              }
            );
          }

          return throwError(
            () => error
          );
        }
      )
    );
  };