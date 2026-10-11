import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ======================================================
// API CONFIG
// ======================================================

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.carsey.in/api';

// ======================================================
// REQUEST STATUS
// ======================================================

export type CarPriceRequestStatus =
  | 'Pending'
  | 'Contacted'
  | 'Closed';

// ======================================================
// CAR PRICE REQUEST
// ======================================================

export interface CarPriceRequest {
  request_id: number;
  car_id: number;
  customer_name: string;
  mobile: string;
  email: string;
  status: CarPriceRequestStatus;
  created_at: string;
  brand?: string;
  model?: string;
  variant?: string;
}

// ======================================================
// API RESPONSE
// ======================================================

export interface CarPriceRequestsResponse {
  success: boolean;
  message?: string;
  data?: {
    requests?: CarPriceRequest[];
    request?: CarPriceRequest;
  };
}

// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class CarPriceRequestsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_BASE_URL}/admin/car-price-requests`;

  // GET ALL REQUESTS
  getRequests(): Observable<CarPriceRequestsResponse> {
    return this.http.get<CarPriceRequestsResponse>(
      this.apiUrl
    );
  }

  // UPDATE REQUEST STATUS
  updateStatus(
    requestId: number,
    status: CarPriceRequestStatus
  ): Observable<CarPriceRequestsResponse> {
    return this.http.patch<CarPriceRequestsResponse>(
      `${this.apiUrl}/${requestId}/status`,
      { status }
    );
  }
}