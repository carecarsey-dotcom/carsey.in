import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  // BACKEND URL
  // ====================================================

  private apiUrl =
    'http://localhost:5000/api/admin';


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(
    private http: HttpClient
  ) {}


  // ====================================================
  // GET ADMIN DASHBOARD
  // ====================================================

  getDashboard(): Observable<DashboardResponse> {

    return this.http.get<DashboardResponse>(
      `${this.apiUrl}/dashboard`
    );

  }

}