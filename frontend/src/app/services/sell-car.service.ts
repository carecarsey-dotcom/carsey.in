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
// SELL CAR REQUEST
// ======================================================

export interface SellCarRequest {

  sell_id: number;

  seller_name: string;

  mobile: string;

  email?: string;

  brand?: string;

  model?: string;

  variant?: string;

  manufacturing_year?: number;

  fuel_type?: string;

  transmission?: string;

  km_driven?: number;

  expected_price?: number;

  front_image?: string;

  back_image?: string;

  left_image?: string;

  right_image?: string;

  status?: string;

  created_at?: string;
}


// ======================================================
// RESPONSE
// ======================================================

export interface SellCarResponse {

  success: boolean;

  message: string;

  data: {

    requests?: SellCarRequest[];

    request?: SellCarRequest;

    sellId?: number;

    status?: string;
  };
}


// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class SellCarService {

  private http =
    inject(HttpClient);


  // ====================================================
  // API URL
  // ====================================================

  private apiUrl =
    API_BASE_URL;


  // ====================================================
  // GET ALL SELL CAR REQUESTS
  // ====================================================

  getRequests():
    Observable<SellCarResponse> {

    return this.http.get<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests`
    );
  }


  // ====================================================
  // GET SINGLE REQUEST
  // ====================================================

  getRequestById(
    sellId: number
  ):
    Observable<SellCarResponse> {

    return this.http.get<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}`
    );
  }


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  updateStatus(
    sellId: number,

    status:
      'Approved' |
      'Rejected'
  ):
    Observable<SellCarResponse> {

    return this.http.patch<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}/status`,
      {
        status
      }
    );
  }
}