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
// LOAN REQUEST INTERFACE
// ======================================================

export interface LoanRequest {

  loan_id: number;

  name: string;

  mobile: string;

  email?: string;

  employment_type?: string;

  monthly_income?: number;

  vehicle_required?: string;

  budget?: number;

  car_model?: string;

  status?: string;

  created_at?: string;

}


// ======================================================
// RESPONSE
// ======================================================

export interface LoanResponse {

  success: boolean;

  message: string;

  data: {

    loans?: LoanRequest[];

    loanId?: number;

    name?: string;

    mobile?: string;

    email?: string;

    employmentType?: string;

    monthlyIncome?: number;

    vehicleRequired?: string;

    budget?: number;

    carModel?: string;

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
export class LoanService {

  private http =
    inject(HttpClient);


  private apiUrl =
    'http://localhost:5000/api';


  // ====================================================
  // GET ALL LOAN REQUESTS
  // ====================================================

  getRequests():
    Observable<LoanResponse> {

    return this.http.get<LoanResponse>(
      `${this.apiUrl}/admin/loan-requests`
    );

  }


  // ====================================================
  // GET SINGLE LOAN REQUEST
  // ====================================================

  getRequestById(
    loanId: number
  ):
    Observable<LoanResponse> {

    return this.http.get<LoanResponse>(
      `${this.apiUrl}/admin/loan-requests/${loanId}`
    );

  }


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  updateStatus(

    loanId: number,

    status:
      'Approved' |
      'Rejected'

  ):
    Observable<LoanResponse> {

    return this.http.patch<LoanResponse>(

      `${this.apiUrl}/admin/loan-requests/${loanId}/status`,

      {
        status
      }

    );

  }

}