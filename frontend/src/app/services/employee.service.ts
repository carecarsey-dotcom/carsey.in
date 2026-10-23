
import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  // =========================================
  // API URL
  // =========================================

  private apiUrl =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000/api'
      : 'https://api.carsey.in/api';

  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) {}

  // =========================================
  // GET TOKEN
  // =========================================

  private getToken(): string | null {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken')
    );
  }

  // =========================================
  // JSON HEADERS
  // =========================================

  private getHeaders(): HttpHeaders {
    const token = this.getToken();

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

  // =========================================
  // AUTH HEADERS
  // For FormData / File Uploads
  // =========================================

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return headers;
  }

  // =========================================
  // GET ALL EMPLOYEES
  // Used in Sell Car Request Assignment
  // =========================================

  getEmployees(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/auth/employees`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // GET MY INSPECTION REQUESTS
  // =========================================

  getMyRequests(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/employee/my-requests`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // SELL CAR WORKFLOW
  // =========================================

  // GET MY ASSIGNED SELL CAR REQUESTS

  getMySellCarRequests(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/employee/sell-car-requests`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // UPDATE ASSIGNED SELL CAR REQUEST
  // Uses multipart/form-data for image uploads.
  // Do not manually set Content-Type.
  // =========================================

  updateMySellCarRequest(
    sellId: number,
    data: FormData
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/employee/sell-car-requests/${Number(sellId)}`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // =========================================
  // SUBMIT SELL CAR REQUEST FOR APPROVAL
  // =========================================

  submitMySellCarRequest(
    sellId: number
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/employee/sell-car-requests/${Number(sellId)}/submit`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // GET REQUEST
  // Existing Method
  // =========================================

  getRequest(
    requestId: number
  ): Observable<any> {
    return this.getRequestById(requestId);
  }

  // =========================================
  // GET REQUEST BY ID
  // =========================================

  getRequestById(
    requestId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // SHARED INSPECTION DRAFT
  // ADMIN + ASSIGNED EMPLOYEE
  // =========================================

  /*
   * Original shared-draft methods preserved as a commented reference:
   *   // GET SHARED INSPECTION DRAFT
   *   getInspectionDraft(
   *     requestId: number
   *   ): Observable<any> {
   *     return this.http.get<any>(
   *       `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/draft`,
   *       {
   *         headers: this.getHeaders()
   *       }
   *     );
   *   }
   * 
   *   // =========================================
   *   // SAVE SHARED INSPECTION DRAFT
   *   // ADMIN + ASSIGNED EMPLOYEE
   *   // =========================================
   * 
   *   saveInspectionDraft(
   *     requestId: number,
   *     draft: any
   *   ): Observable<any> {
   *     return this.http.put<any>(
   *       `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/draft`,
   *       {
   *         draft
   *       },
   *       {
   *         headers: this.getHeaders()
   *       }
   *     );
   *   }
   */

  // GET SHARED INSPECTION DRAFT
  // Admin + assigned Employee
  getInspectionDraft(requestId: number): Observable<any> {
    const id = Number(requestId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid inspection request ID is required.');
    }

    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/request/${id}/draft`,
      { headers: this.getHeaders() }
    );
  }

  // SAVE SHARED INSPECTION DRAFT
  // Admin + assigned Employee
  saveInspectionDraft(requestId: number, draft: any): Observable<any> {
    const id = Number(requestId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid inspection request ID is required.');
    }
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) {
      throw new Error('A valid inspection draft is required.');
    }

    return this.http.put<any>(
      `${this.apiUrl}/inspection-requests/request/${id}/draft`,
      { draft },
      { headers: this.getHeaders() }
    );
  }

  // =========================================
  // ACCEPT INSPECTION REQUEST
  // =========================================

  acceptRequest(
    requestId: number
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/accept`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // REJECT INSPECTION REQUEST
  // =========================================

  rejectRequest(
    requestId: number,
    remark = ''
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/reject`,
      {
        employeeRemark: remark
      },
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // START INSPECTION
  // =========================================

  startInspection(
    requestId: number
  ): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/start`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // SUBMIT INSPECTION
  // =========================================

  submitInspection(
    requestId: number,
    data: any,
    vehicleImages: Array<{
      type: string;
      row?: string;
      column?: number;
      file: File | null;
    }> = []
  ): Observable<any> {

    const formData = new FormData();

    // Keep inspection data and images
    // in one multipart request.

    formData.append(
      'inspectionData',
      JSON.stringify(data)
    );

    let index = 0;

    for (const image of vehicleImages) {

      if (!image?.file) {
        continue;
      }

      formData.append(
        'vehicleImages',
        image.file,
        image.file.name
      );

      formData.append(
        `imageType_${index}`,
        image.type || 'Vehicle Photo'
      );

      if (image.row) {
        formData.append(
          `imageRow_${index}`,
          image.row
        );
      }

      if (image.column !== undefined) {
        formData.append(
          `imageColumn_${index}`,
          String(image.column)
        );
      }

      index++;
    }

    // Do not manually set Content-Type.
    // Browser adds the multipart boundary.

    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/submit`,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // =========================================
  // UPLOAD VEHICLE IMAGES
  // Existing Method
  // =========================================

  uploadVehicleImages(
    carId: number,
    images: Array<{
      type: string;
      row?: string;
      column?: number;
      file: File | null;
    }>
  ): Observable<any> {

    const formData = new FormData();

    let fileIndex = 0;

    images.forEach(image => {

      if (!image?.file) {
        return;
      }

      formData.append(
        'images',
        image.file,
        image.file.name
      );

      formData.append(
        `imageType_${fileIndex}`,
        image.type || 'Vehicle Photo'
      );

      if (image.row) {
        formData.append(
          `imageRow_${fileIndex}`,
          image.row
        );
      }

      if (image.column !== undefined) {
        formData.append(
          `imageColumn_${fileIndex}`,
          String(image.column)
        );
      }

      fileIndex++;
    });

    return this.http.post<any>(
      `${this.apiUrl}/admin/vehicles/${Number(carId)}/images`,
      formData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // =========================================
  // GENERATE INSPECTION REPORT PDF
  // =========================================

  generateInspectionReportPdf(
    reportId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/admin/inspection-reports/${Number(reportId)}/pdf`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // GET REQUEST REPORT
  // =========================================

  getRequestReport(
    requestId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/report`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================================
  // GET REQUEST BY REPORT ID
  // =========================================

  getRequestByReportId(
    reportId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/inspection-requests/report/${Number(reportId)}/request`,
      {
        headers: this.getHeaders()
      }
    );
  }

}

