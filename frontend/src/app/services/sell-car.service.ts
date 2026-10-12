import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.carsey.in/api';

// =====================================================
// SELL CAR REQUEST INTERFACE
// =====================================================

export interface SellCarRequest {

  sell_id: number;

  seller_name: string;

  owner_name?: string;

  owner_classification?:
    | 'First Owner'
    | 'Second Owner'
    | 'Third Owner'
    | string;

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

  // Exterior images

  front_image?: string | null;

  back_image?: string | null;

  left_image?: string | null;

  right_image?: string | null;

  // Interior images

  interior_front_image?: string | null;

  interior_rear_image?: string | null;

  // Legacy image fields - kept for compatibility

  open_dicky_image?: string | null;

  open_bonnet_image?: string | null;

  dashboard_image?: string | null;

  // Other vehicle images

  odometer_image?: string | null;

  extra_image?: string | null;

  // Status and workflow

  status?: string;

  created_at?: string;

  assigned_employee_id?: number | null;

  workflow_status?: string;

  correction_note?: string;

  submitted_for_approval_at?: string | null;

}

// =====================================================
// SELL CAR RESPONSE INTERFACE
// =====================================================

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

// =====================================================
// SELL CAR SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class SellCarService {

  private http = inject(HttpClient);

  private apiUrl = API_BASE_URL;

  // ===================================================
  // AUTHENTICATION HEADERS
  // ===================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return headers;
  }

  // ===================================================
  // GET ALL SELL CAR REQUESTS
  // ===================================================

  getRequests(): Observable<SellCarResponse> {

    return this.http.get<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // ===================================================
  // GET SELL CAR REQUEST BY ID
  // ===================================================

  getRequestById(
    sellId: number
  ): Observable<SellCarResponse> {

    return this.http.get<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // ===================================================
  // UPDATE STATUS
  // ===================================================

  updateStatus(
    sellId: number,
    status: 'Approved' | 'Rejected'
  ): Observable<SellCarResponse> {

    return this.http.patch<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}/status`,
      {
        status
      },
      {
        headers: this.getHeaders()
      }
    );
  }

  // ===================================================
  // ASSIGN EMPLOYEE
  // ===================================================

  assignEmployee(
    sellId: number,
    employeeId: number
  ): Observable<SellCarResponse> {

    return this.http.patch<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}/assign`,
      {
        employeeId
      },
      {
        headers: this.getHeaders()
      }
    );
  }

  // ===================================================
  // SEND FOR CORRECTION
  // ===================================================

  sendForCorrection(
    sellId: number,
    correctionNote: string
  ): Observable<SellCarResponse> {

    return this.http.patch<SellCarResponse>(
      `${this.apiUrl}/admin/sell-car-requests/${sellId}/correction`,
      {
        correctionNote
      },
      {
        headers: this.getHeaders()
      }
    );
  }

}