import {
  ApplicationConfig,
  provideZoneChangeDetection
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  routes
} from './app.routes';

import {
  authInterceptor
} from './interceptors/auth.interceptor';


export const appConfig: ApplicationConfig = {

  providers: [

    // ==================================================
    // ZONE CHANGE DETECTION
    // ==================================================

    provideZoneChangeDetection({

      eventCoalescing: true

    }),


    // ==================================================
    // ROUTER
    // ==================================================

    provideRouter(
      routes
    ),


    // ==================================================
    // HTTP CLIENT + AUTH INTERCEPTOR
    // ==================================================

    provideHttpClient(

      withInterceptors([

        authInterceptor

      ])

    )

  ]

};