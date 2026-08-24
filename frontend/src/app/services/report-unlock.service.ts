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


export interface ReportUnlockRequest {

  request_id: number;

  car_id: number;

  name: string;

  mobile: string;

  email: string;

  status: string;

  created_at: string;

}


export interface ReportUnlockResponse {

  success: boolean;

  message: string;

  data: {

    requests:
      ReportUnlockRequest[];

  };

}


@Injectable({
  providedIn: 'root'
})
export class ReportUnlockService {

  private http =
    inject(HttpClient);


private apiUrl =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://carseyin-production.up.railway.app/api';

  // ======================================================
  // GET REPORT UNLOCK REQUESTS
  // ======================================================

  getRequests():
    Observable<ReportUnlockResponse> {

    return this.http.get<ReportUnlockResponse>(
      `${this.apiUrl}/admin/report-unlock-requests`
    );

  }


  // ======================================================
  // APPROVE / REJECT
  // ======================================================

  updateStatus(
    requestId: number,
    status: 'Approved' | 'Rejected'
  ):
    Observable<any> {

    return this.http.patch(

      `${this.apiUrl}/admin/report-unlock-requests/${requestId}/status`,

      {
        status
      }

    );

  }

}