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

    admin?: any;

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

      : 'https://api.carsey.in';


  // ====================================================
  // FORM DATA
  // ====================================================

  email = '';

  password = '';

  loading = false;

  errorMessage = '';

  // ====================================================
  // SHOW / HIDE PASSWORD
  // ====================================================

  showPassword = false;


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

      const adminData =
        localStorage.getItem('admin');


      let user: any = null;


      if (adminData) {

        try {

          user =
            JSON.parse(adminData);

        } catch (error) {

          console.error(
            'Unable to parse saved user data:',
            error
          );

        }

      }


      // ================================================
      // EMPLOYEE
      // ================================================

      if (
        user?.role === 'Employee'
      ) {

        this.router.navigate(
          ['/employee/dashboard'],
          {
            replaceUrl: true
          }
        );

        return;

      }


      // ================================================
      // ADMIN
      // ================================================

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


    // ==================================================
    // CLEAR PREVIOUS ERROR
    // ==================================================

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
    // LOGIN API URL
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

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (
          response: LoginResponse
        ) => {

          console.log(
            'Login Response:',
            response
          );


          // =============================================
          // SUCCESS + TOKEN
          // =============================================

          if (

            response &&

            response.success &&

            response.data?.token

          ) {


            // =========================================
            // SAVE JWT TOKEN
            // =========================================

            localStorage.setItem(
              'token',
              response.data.token
            );


            console.log(
              'JWT Token Saved'
            );


            // =========================================
            // SAVE USER / ADMIN DATA
            // =========================================

            if (
              response.data.admin
            ) {

              localStorage.setItem(
                'admin',
                JSON.stringify(
                  response.data.admin
                )
              );


              // =======================================
              // DEBUG ROLE
              // =======================================

              console.log(
                'Logged in user:',
                response.data.admin
              );

              console.log(
                'Logged in role:',
                response.data.admin?.role
              );

            }


            // =========================================
            // CLEAR ERROR
            // =========================================

            this.errorMessage = '';


            // =========================================
            // GET ROLE
            // =========================================

            const loggedInUser =
              response.data.admin;


            const role =
              String(
                loggedInUser?.role || ''
              ).trim();


            // =========================================
            // EMPLOYEE DASHBOARD
            // =========================================

            if (
              role === 'Employee'
            ) {

              console.log(
                'Employee login detected.'
              );


              this.router.navigate(
                ['/employee/dashboard'],
                {
                  replaceUrl: true
                }
              );


              this.loading = false;

              return;

            }


            // =========================================
            // ADMIN DASHBOARD
            // =========================================

            if (
              role === 'Admin'
            ) {

              console.log(
                'Admin login detected.'
              );


              this.router.navigate(
                ['/admin/dashboard'],
                {
                  replaceUrl: true
                }
              );


              this.loading = false;

              return;

            }


            // =========================================
            // UNKNOWN ROLE
            // =========================================

            console.error(
              'Unknown login role:',
              role
            );


            this.errorMessage =
              'User role is not authorized.';


            // Remove token if role is invalid

            localStorage.removeItem(
              'token'
            );

            localStorage.removeItem(
              'admin'
            );


            this.loading = false;

            return;

          }


          // =============================================
          // LOGIN FAILED FROM BACKEND
          // =============================================

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