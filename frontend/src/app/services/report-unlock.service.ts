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
    'http://localhost:5000/api';


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