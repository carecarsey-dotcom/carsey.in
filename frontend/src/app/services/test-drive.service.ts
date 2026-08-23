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
// TEST DRIVE REQUEST INTERFACE
// ======================================================

export interface TestDriveRequest {

  request_id: number;

  car_id: number;

  name: string;

  mobile: string;

  email?: string;

  city?: string;

  preferred_date?: string;

  preferred_time?: string;

  status?: string;

  created_at?: string;

}


// ======================================================
// API RESPONSE
// ======================================================

export interface TestDriveResponse {

  success: boolean;

  message: string;

  data: {

    requests?: TestDriveRequest[];

    request?: TestDriveRequest;

    requestId?: number;

    status?: string;

    message?: string;

  };

}


// ======================================================
// SERVICE
// ======================================================

@Injectable({
  providedIn: 'root'
})
export class TestDriveService {

  private http =
    inject(HttpClient);


  private apiUrl =
    'http://localhost:5000/api';


  // ====================================================
  // GET ALL TEST DRIVE REQUESTS
  // ADMIN
  // ====================================================

  getRequests():
    Observable<TestDriveResponse> {

    return this.http.get<TestDriveResponse>(
      `${this.apiUrl}/admin/test-drive-requests`
    );

  }


  // ====================================================
  // GET SINGLE REQUEST
  // ADMIN
  // ====================================================

  getRequestById(
    requestId: number
  ):
    Observable<TestDriveResponse> {

    return this.http.get<TestDriveResponse>(
      `${this.apiUrl}/admin/test-drive-requests/${requestId}`
    );

  }


  // ====================================================
  // UPDATE STATUS
  // APPROVED / REJECTED
  // ====================================================

  updateStatus(
    requestId: number,
    status:
      'Pending' |
      'Approved' |
      'Rejected'
  ):
    Observable<TestDriveResponse> {

    return this.http.patch<TestDriveResponse>(
      `${this.apiUrl}/admin/test-drive-requests/${requestId}/status`,
      {
        status
      }
    );

  }


  // ====================================================
  // CUSTOMER CREATE REQUEST
  // ====================================================

  createRequest(
    carId: number,

    data: {

      name: string;

      mobile: string;

      email: string;

      city: string;

      preferredDate: string;

      preferredTime: string;

    }

  ):
    Observable<TestDriveResponse> {

    return this.http.post<TestDriveResponse>(
      `${this.apiUrl}/vehicles/${carId}/test-drive`,
      data
    );

  }

}