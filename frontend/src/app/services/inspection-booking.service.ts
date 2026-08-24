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


@Injectable({
  providedIn: 'root'
})

export class InspectionBookingService {

  private readonly http =
    inject(HttpClient);


  // ======================================================
  // API URL
  // ======================================================

  private readonly apiUrl =
    API_BASE_URL;


  // ======================================================
  // GET ALL BOOKINGS
  // ======================================================

  getAllBookings(): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/admin/inspection-bookings`
    );
  }


  // ======================================================
  // GET BOOKING BY ID
  // ======================================================

  getBookingById(
    bookingId: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/admin/inspection-bookings/${bookingId}`
    );
  }


  // ======================================================
  // UPDATE BOOKING STATUS
  // ======================================================

  updateBookingStatus(
    bookingId: number,

    status:
      'Pending' |
      'Approved' |
      'Rejected'
  ): Observable<any> {

    return this.http.patch<any>(
      `${this.apiUrl}/admin/inspection-bookings/${bookingId}/status`,
      {
        status
      }
    );
  }
}