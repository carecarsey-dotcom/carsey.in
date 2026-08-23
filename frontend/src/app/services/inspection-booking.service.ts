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
    'http://localhost:5000/api';


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