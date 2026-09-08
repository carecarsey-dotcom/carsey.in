import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://api.carsey.in/api';

@Injectable({ providedIn: 'root' })
export class InspectionBookingService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = API_BASE_URL;

  getAllBookings(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/inspection-bookings`
    );
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/inspection-bookings/${bookingId}`
    );
  }

  updateBookingStatus(
    bookingId: number,
    status: 'Pending' | 'Approved' | 'Rejected'
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/admin/inspection-bookings/${bookingId}/status`,
      { status }
    );
  }

  getEmployees(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/auth/employees`
    );
  }

  assignInspection(
    bookingId: number,
    employeeId: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/admin/inspection-bookings/${bookingId}/assign`,
      { employeeId }
    );
  }

  // ======================================================
  // ADMIN INSPECTION REQUESTS
  // ======================================================

  getAdminRequests(status?: string): Observable<any> {
    const url =
      status
        ? `${this.apiUrl}/inspection-requests?status=${encodeURIComponent(status)}`
        : `${this.apiUrl}/inspection-requests`;

    return this.http.get<any>(url);
  }

  getRequestByReportId(reportId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/report/${Number(reportId)}/request`
    );
  }

  approveInspectionRequest(
    requestId: number,
    adminRemark = ''
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/approve`,
      { adminRemark }
    );
  }

  rejectInspectionRequest(
    requestId: number,
    adminRemark: string
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/reject-admin`,
      { adminRemark }
    );
  }

  publishInspectionRequest(
    requestId: number,
    price: number
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/publish`,
      { price }
    );
  }
}
