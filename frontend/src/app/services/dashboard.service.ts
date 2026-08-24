import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';


// ======================================================
// DASHBOARD RESPONSE INTERFACE
// ======================================================

export interface DashboardData {

  activeListings: number;

  soldCars: number;

  unlockRequests: number;

  testDriveRequests: number;

  financeRequests: number;

  sellCarRequests: number;

  exchangeRequests: number;

  loanRequests: number;

  inspectionBookings: number;
}


// ======================================================
// API RESPONSE
// ======================================================

export interface DashboardResponse {

  success: boolean;

  message: string;

  data: {

    dashboard: DashboardData;

  };
}


// ======================================================
// SERVICE
// ======================================================

@Injectable({

  providedIn: 'root'

})

export class DashboardService {


  // ====================================================
  // BACKEND BASE URL
  // ====================================================
  //
  // LOCAL:
  // http://localhost:5000
  //
  // PRODUCTION:
  // https://carseyin-production.up.railway.app
  //
  // ====================================================

  private readonly API_BASE_URL =

    window.location.hostname === 'localhost' ||

    window.location.hostname === '127.0.0.1'

      ? 'http://localhost:5000'

      : 'https://carseyin-production.up.railway.app';


  // ====================================================
  // ADMIN API URL
  // ====================================================

  private readonly apiUrl =

    `${this.API_BASE_URL}/api/admin`;


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(

    private readonly http: HttpClient

  ) {}


  // ====================================================
  // GET ADMIN DASHBOARD
  // ====================================================

  getDashboard(): Observable<DashboardResponse> {


    // ==================================================
    // DASHBOARD URL
    // ==================================================

    const dashboardUrl =

      `${this.apiUrl}/dashboard`;


    // ==================================================
    // LOG API URL
    // ==================================================

    console.log(

      'Dashboard API URL:',

      dashboardUrl

    );


    // ==================================================
    // GET JWT TOKEN
    // ==================================================

    const token =

      localStorage.getItem('token');


    // ==================================================
    // REQUEST HEADERS
    // ==================================================

    let headers = new HttpHeaders();


    // ==================================================
    // ADD JWT AUTHORIZATION
    // ==================================================

    if (token) {

      headers = headers.set(

        'Authorization',

        `Bearer ${token}`

      );

    }


    // ==================================================
    // LOG AUTH STATUS
    // ==================================================

    console.log(

      'Dashboard JWT Available:',

      !!token

    );


    // ==================================================
    // API REQUEST
    // ==================================================

    return this.http.get<DashboardResponse>(

      dashboardUrl,

      {

        headers: headers

      }

    );

  }

}