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


interface LoginResponse {

  success: boolean;

  message: string;

  data?: {

    token?: string;

    admin?: unknown;

  };

}


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


  private readonly http =
    inject(HttpClient);


  private readonly router =
    inject(Router);


  email = '';

  password = '';

  loading = false;

  errorMessage = '';


  // ==================================================
  // INIT
  // ==================================================

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


  // ==================================================
  // LOGIN
  // ==================================================

  login(): void {

    this.errorMessage = '';


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !this.email ||
      !this.password
    ) {

      this.errorMessage =
        'Email and password are required.';

      return;

    }


    this.loading = true;


    // ==================================================
    // LOGIN API
    // ==================================================

    this.http
      .post<LoginResponse>(
        'http://localhost:5000/api/auth/login',
        {
          email:
            this.email,

          password:
            this.password
        }
      )
      .subscribe({

        // ==================================================
        // SUCCESS
        // ==================================================

        next: (
          response
        ) => {

          console.log(
            'Login Response:',
            response
          );


          if (
            response.success &&
            response.data?.token
          ) {


            // ==================================================
            // SAVE JWT TOKEN
            // ==================================================

            localStorage.setItem(
              'token',
              response.data.token
            );


            console.log(
              'JWT Token Saved'
            );


            // ==================================================
            // SAVE ADMIN DATA
            // ==================================================

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


            // ==================================================
            // DASHBOARD
            // ==================================================

            this.router.navigate(
              ['/admin/dashboard'],
              {
                replaceUrl: true
              }
            );

          }

          else {

            this.errorMessage =
              response.message ||
              'Login failed.';

          }


          this.loading = false;

        },


        // ==================================================
        // ERROR
        // ==================================================

        error: (
          error
        ) => {

          console.error(
            'Login Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ??
            'Unable to login.';


          this.loading = false;

        }

      });

  }

}