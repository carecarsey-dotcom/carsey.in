import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';


// ======================================================
// LOGIN RESPONSE
// ======================================================

interface LoginResponse {
  success: boolean;
  message: string;

  data?: {
    token?: string;
    admin?: unknown;
  };
}


// ======================================================
// COMPONENT
// ======================================================

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl:
    './login.component.html'
})

export class LoginComponent
  implements OnInit {


  // ====================================================
  // SERVICES
  // ====================================================

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);


  // ====================================================
  // API URL
  // ====================================================

  private readonly API_BASE_URL =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

      ? 'http://localhost:5000'

      : 'https://carseyin-production.up.railway.app';


  // ====================================================
  // FORM DATA
  // ====================================================

  email = '';

  password = '';

  loading = false;

  errorMessage = '';


  // ====================================================
  // INIT
  // ====================================================

  ngOnInit(): void {

    const token =
      localStorage.getItem('token');


    // ==================================================
    // ALREADY LOGGED IN
    // ==================================================

    if (token) {

      this.router.navigate(
        ['/admin/dashboard'],
        {
          replaceUrl: true
        }
      );

    }

  }


  // ====================================================
  // LOGIN
  // ====================================================

  login(): void {

    // Clear previous error
    this.errorMessage = '';


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !this.email ||
      !this.email.trim()
    ) {

      this.errorMessage =
        'Email is required.';

      return;
    }


    if (
      !this.password
    ) {

      this.errorMessage =
        'Password is required.';

      return;
    }


    // ==================================================
    // START LOADING
    // ==================================================

    this.loading = true;


    // ==================================================
    // API URL
    // ==================================================

    const loginUrl =
      `${this.API_BASE_URL}/api/auth/login`;


    console.log(
      'Login API URL:',
      loginUrl
    );


    // ==================================================
    // LOGIN REQUEST
    // ==================================================

    this.http
      .post<LoginResponse>(
        loginUrl,
        {
          email:
            this.email.trim(),

          password:
            this.password
        }
      )

      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          response: LoginResponse
        ) => {

          console.log(
            'Login Response:',
            response
          );


          // ===============================================
          // SUCCESS + TOKEN
          // ===============================================

          if (
            response &&
            response.success &&
            response.data?.token
          ) {


            // =============================================
            // SAVE JWT TOKEN
            // =============================================

            localStorage.setItem(
              'token',
              response.data.token
            );


            console.log(
              'JWT Token Saved'
            );


            // =============================================
            // SAVE ADMIN DATA
            // =============================================

            if (
              response.data.admin
            ) {

              localStorage.setItem(
                'admin',
                JSON.stringify(
                  response.data.admin
                )
              );

            }


            // =============================================
            // CLEAR ERROR
            // =============================================

            this.errorMessage = '';


            // =============================================
            // DASHBOARD
            // =============================================

            this.router.navigate(
              ['/admin/dashboard'],
              {
                replaceUrl: true
              }
            );

          }

          // ===============================================
          // LOGIN FAILED FROM BACKEND
          // ===============================================

          else {

            this.errorMessage =
              response?.message ||
              'Invalid email or password.';

          }


          // =============================================
          // STOP LOADING
          // =============================================

          this.loading = false;

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          error: any
        ) => {

          console.error(
            'Login Error:',
            error
          );


          // =============================================
          // CONNECTION / CORS ERROR
          // =============================================

          if (
            error?.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to server. Please try again.';

          }


          // =============================================
          // 401
          // =============================================

          else if (
            error?.status === 401
          ) {

            this.errorMessage =
              error?.error?.message ||
              'Invalid email or password.';

          }


          // =============================================
          // 403
          // =============================================

          else if (
            error?.status === 403
          ) {

            this.errorMessage =
              error?.error?.message ||
              'Access denied.';

          }


          // =============================================
          // 404
          // =============================================

          else if (
            error?.status === 404
          ) {

            this.errorMessage =
              'Login API not found. Please check backend route.';

          }


          // =============================================
          // 500
          // =============================================

          else if (
            error?.status >= 500
          ) {

            this.errorMessage =
              error?.error?.message ||
              'Server error. Please try again later.';

          }


          // =============================================
          // OTHER ERROR
          // =============================================

          else {

            this.errorMessage =
              error?.error?.message ||
              error?.message ||
              'Unable to login.';

          }


          // =============================================
          // STOP LOADING
          // =============================================

          this.loading = false;

        }

      });

  }

}