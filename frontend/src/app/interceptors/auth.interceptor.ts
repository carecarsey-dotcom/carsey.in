import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
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


export const authInterceptor:
  HttpInterceptorFn =
  (req, next) => {


    const router =
      inject(Router);


    // ==================================================
    // GET TOKEN
    // ==================================================

    const token =
      localStorage.getItem(
        'token'
      );


    // ==================================================
    // NO TOKEN
    // ==================================================

    if (!token) {

      return next(req);

    }


    // ==================================================
    // ADD JWT TOKEN
    // ==================================================

    const authRequest =
      req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

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