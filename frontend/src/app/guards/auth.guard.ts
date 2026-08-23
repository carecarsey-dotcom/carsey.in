import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';


// ==================================================
// AUTH GUARD
// ==================================================

export const authGuard: CanActivateFn = () => {

  const router =
    inject(Router);


  // ==================================================
  // GET TOKEN
  // ==================================================

  const token =
    localStorage.getItem('token');


  // ==================================================
  // TOKEN EXISTS
  // ==================================================

  if (token) {

    return true;

  }


  // ==================================================
  // TOKEN NOT EXISTS
  // LOGIN PAGE
  // ==================================================

  return router.createUrlTree([
    '/login'
  ]);

};