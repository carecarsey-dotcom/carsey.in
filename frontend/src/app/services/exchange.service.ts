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
// EXCHANGE REQUEST
// ======================================================

export interface ExchangeRequest {

  exchange_id: number;

  name: string;

  mobile: string;

  email?: string;

  current_brand?: string;

  current_model?: string;

  current_year?: number;

  current_vehicle_price?: number;

  preferred_brand?: string;

  preferred_model?: string;

  preferred_variant?: string;

  budget?: number;

  vehicle_image?: string;

  status?: string;

  created_at?: string;
}


// ======================================================
// RESPONSE
// ======================================================

export interface ExchangeResponse {

  success: boolean;

  message: string;

  data: {

    requests?: ExchangeRequest[];

    request?: ExchangeRequest;

    exchangeId?: number;

    status?: string;
  };
}


// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {

  private http =
    inject(HttpClient);


  // ====================================================
  // API URL
  // ====================================================

  private apiUrl =
    API_BASE_URL;


  // ==========================================
  // GET ALL
  // ==========================================

  getRequests():
    Observable<ExchangeResponse> {

    return this.http.get<ExchangeResponse>(
      `${this.apiUrl}/admin/exchange-requests`
    );
  }


  // ==========================================
  // GET BY ID
  // ==========================================

  getRequestById(
    exchangeId: number
  ):
    Observable<ExchangeResponse> {

    return this.http.get<ExchangeResponse>(
      `${this.apiUrl}/admin/exchange-requests/${exchangeId}`
    );
  }


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  updateStatus(
    exchangeId: number,

    status:
      'Approved' |
      'Rejected'
  ):
    Observable<ExchangeResponse> {

    return this.http.patch<ExchangeResponse>(
      `${this.apiUrl}/admin/exchange-requests/${exchangeId}/status`,
      {
        status
      }
    );
  }
}