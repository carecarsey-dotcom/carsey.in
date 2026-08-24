import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


// ======================================================
// API CONFIG
// ======================================================

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://carseyin-production.up.railway.app/api';


// ======================================================
// FINANCE REQUEST
// ======================================================

export interface FinanceRequest {

  finance_id: number;

  car_id: number;

  name: string;

  mobile: string;

  email?: string;

  occupation?: string;

  monthly_income?: number;

  down_payment?: number;

  status?: string;

  created_at?: string;
}


// ======================================================
// RESPONSE
// ======================================================

export interface FinanceResponse {

  success: boolean;

  message: string;

  data: {

    requests?: FinanceRequest[];

    request?: FinanceRequest;

    financeId?: number;

    carId?: number;

    name?: string;

    mobile?: string;

    email?: string;

    occupation?: string;

    monthlyIncome?: number;

    downPayment?: number;

    status?: string;

    createdAt?: string;
  };
}


// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  private http =
    inject(HttpClient);


  // ====================================================
  // API URL
  // ====================================================

  private apiUrl =
    API_BASE_URL;


  // ====================================================
  // GET ALL FINANCE REQUESTS
  // ====================================================

  getRequests():
    Observable<FinanceResponse> {

    return this.http.get<FinanceResponse>(
      `${this.apiUrl}/admin/finance-requests`
    );
  }


  // ====================================================
  // GET REQUEST BY ID
  // ====================================================

  getRequestById(
    financeId: number
  ):
    Observable<FinanceResponse> {

    return this.http.get<FinanceResponse>(
      `${this.apiUrl}/admin/finance-requests/${financeId}`
    );
  }


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  updateStatus(
    financeId: number,

    status:
      'Pending' |
      'Approved' |
      'Rejected'
  ):
    Observable<FinanceResponse> {

    return this.http.patch<FinanceResponse>(
      `${this.apiUrl}/admin/finance-requests/${financeId}/status`,
      {
        status
      }
    );
  }


  // ====================================================
  // CUSTOMER CREATE FINANCE REQUEST
  // ====================================================

  createRequest(
    carId: number,

    data: {

      name: string;

      mobile: string;

      email: string;

      occupation: string;

      monthlyIncome: number;

      downPayment: number;
    }
  ):
    Observable<FinanceResponse> {

    return this.http.post<FinanceResponse>(
      `${this.apiUrl}/vehicles/${carId}/finance`,
      data
    );
  }
}