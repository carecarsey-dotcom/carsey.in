import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.carsey.in/api';

export interface SellCarRequest {
  sell_id: number;
  seller_name: string;
  owner_name?: string;
  owner_classification?: 'First Owner' | 'Second Owner' | 'Third Owner' | string;
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
  assigned_employee_id?: number | null;
  workflow_status?: string;
  correction_note?: string;
  submitted_for_approval_at?: string | null;
}

export interface SellCarResponse {
  success: boolean;
  message: string;
  data?: {
    requests?: SellCarRequest[];
    request?: SellCarRequest;
    sellId?: number;
    status?: string;
    workflowStatus?: string;
    assignedEmployeeId?: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SellCarService {
  private http = inject(HttpClient);
  private apiUrl = API_BASE_URL;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getRequests(): Observable<SellCarResponse> {
    return this.http.get<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests`, { headers: this.getHeaders() });
  }

  getRequestById(sellId: number): Observable<SellCarResponse> {
    return this.http.get<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests/${sellId}`, { headers: this.getHeaders() });
  }

  updateStatus(sellId: number, status: 'Approved' | 'Rejected'): Observable<SellCarResponse> {
    return this.http.patch<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests/${sellId}/status`, { status }, { headers: this.getHeaders() });
  }

  assignEmployee(sellId: number, employeeId: number): Observable<SellCarResponse> {
    return this.http.patch<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests/${sellId}/assign`, { employeeId }, { headers: this.getHeaders() });
  }

  sendForCorrection(sellId: number, correctionNote: string): Observable<SellCarResponse> {
    return this.http.patch<SellCarResponse>(`${this.apiUrl}/admin/sell-car-requests/${sellId}/correction`, { correctionNote }, { headers: this.getHeaders() });
  }
}
