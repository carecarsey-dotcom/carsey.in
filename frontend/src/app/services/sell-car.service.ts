import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.carsey.in/api';

export interface SellCarRequest {
  sell_id: number;
  seller_name: string;
  owner_name?: string;
  mobile: string;
  email?: string;
  city?: string;
  brand?: string;
  model?: string;
  variant?: string;
  vehicle_number?: string;
  manufacturing_year?: number;
  fuel_type?: string;
  transmission?: string;
  km_driven?: number;
  expected_price?: number;
  front_image?: string;
  back_image?: string;
  left_image?: string;
  right_image?: string;
  interior_front_image?: string;
  interior_rear_image?: string;
  open_dicky_image?: string;
  open_bonnet_image?: string;
  odometer_image?: string;
  dashboard_image?: string;
  status?: string;
  created_at?: string;
}

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

@Injectable({ providedIn: 'root' })
export class SellCarService {
  private http = inject(HttpClient);
  private apiUrl = API_BASE_URL;

  getRequests(): Observable<SellCarResponse> {
    return this.http.get<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests`);
  }

  getRequestById(sellId: number): Observable<SellCarResponse> {
    return this.http.get<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests/${sellId}`);
  }

  updateStatus(sellId: number, status: 'Approved' | 'Rejected'): Observable<SellCarResponse> {
    return this.http.patch<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}/status`,
      { status }
    );
  }
}
