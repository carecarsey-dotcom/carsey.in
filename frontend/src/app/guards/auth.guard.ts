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

export const authGuard: CanActivateFn = (
  route,
  state
) => {

  const router = inject(Router);

  // ==================================================
  // GET TOKEN
  // ==================================================

  const token =
    localStorage.getItem('token');

  // ==================================================
  // TOKEN NOT EXISTS
  // ==================================================

  if (!token) {

    return router.createUrlTree([
      '/login'
    ]);
  }

  // ==================================================
  // READ JWT PAYLOAD
  // ==================================================

  try {

    const tokenParts =
      token.split('.');

    // JWT must contain:
    // header.payload.signature

    if (tokenParts.length !== 3) {

      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      return router.createUrlTree([
        '/login'
      ]);
    }

    const payload =
      tokenParts[1];

    // ==================================================
    // BASE64URL → JSON
    // ==================================================

    const base64 =
      payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const jsonPayload =
      decodeURIComponent(
        atob(base64)
          .split('')
          .map(
            char =>
              '%' +
              ('00' + char.charCodeAt(0).toString(16))
                .slice(-2)
          )
          .join('')
      );

    const decoded =
      JSON.parse(jsonPayload);

    // ==================================================
    // GET ROLE
    // ==================================================

    const role =
      decoded?.role;

    // ==================================================
    // TOKEN EXPIRY CHECK
    // ==================================================

    if (
      decoded?.exp &&
      Date.now() >= decoded.exp * 1000
    ) {

      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      return router.createUrlTree([
        '/login'
      ]);
    }

    // ==================================================
    // ROLE NOT FOUND
    // ==================================================

    if (
      role !== 'Admin' &&
      role !== 'Employee'
    ) {

      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      return router.createUrlTree([
        '/login'
      ]);
    }

    // ==================================================
    // CURRENT URL
    // ==================================================

    const url =
      state.url;

    // ==================================================
    // EMPLOYEE ACCESS
    // ==================================================

    if (
      url.startsWith('/employee')
    ) {

      if (role !== 'Employee') {

        return router.createUrlTree([
          '/admin/dashboard'
        ]);
      }

      return true;
    }

    // ==================================================
    // ADMIN ACCESS
    // ==================================================

    if (
      url.startsWith('/admin')
    ) {

      if (role !== 'Admin') {

        return router.createUrlTree([
          '/employee/dashboard'
        ]);
      }

      return true;
    }

    // ==================================================
    // OTHER PROTECTED ROUTES
    // ==================================================

    return true;

  } catch (error) {

    console.error(
      'Auth Guard Error:',
      error
    );

    // ==================================================
    // INVALID TOKEN
    // ==================================================

    localStorage.removeItem('token');
    localStorage.removeItem('admin');

    return router.createUrlTree([
      '/login'
    ]);
  }
};