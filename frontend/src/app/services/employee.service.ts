import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {

  private apiUrl =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000/api'
      : 'https://api.carsey.in/api';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken')
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getMyRequests(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inspection-requests/employee/my-requests`, { headers: this.getHeaders() });
  }

  getRequest(requestId: number): Observable<any> {
    return this.getRequestById(requestId);
  }

  getRequestById(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inspection-requests/request/${Number(requestId)}`, { headers: this.getHeaders() });
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inspection-requests/request/${Number(requestId)}/accept`, {}, { headers: this.getHeaders() });
  }

  rejectRequest(requestId: number, remark = ''): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inspection-requests/request/${Number(requestId)}/reject`, { employeeRemark: remark }, { headers: this.getHeaders() });
  }

  startInspection(requestId: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/inspection-requests/request/${Number(requestId)}/start`, {}, { headers: this.getHeaders() });
  }

  submitInspection(
    requestId: number,
    data: any,
    vehicleImages: Array<{ type: string; row?: string; column?: number; file: File | null }> = []
  ): Observable<any> {
    const formData = new FormData();
    formData.append('inspectionData', JSON.stringify(data));

    let index = 0;
    for (const image of vehicleImages) {
      if (!image?.file) continue;
      formData.append('vehicleImages', image.file, image.file.name);
      formData.append(`imageType_${index}`, image.type || 'Vehicle Photo');
      if (image.row) formData.append(`imageRow_${index}`, image.row);
      if (image.column !== undefined) formData.append(`imageColumn_${index}`, String(image.column));
      index++;
    }

    return this.http.patch<any>(
      `${this.apiUrl}/inspection-requests/request/${Number(requestId)}/submit`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // Kept for existing callers. Employee Submit no longer needs these calls.
  uploadVehicleImages(carId: number, images: Array<{ type: string; row?: string; column?: number; file: File | null }>): Observable<any> {
    const formData = new FormData();
    let fileIndex = 0;
    images.forEach(image => {
      if (!image?.file) return;
      formData.append('images', image.file, image.file.name);
      formData.append(`imageType_${fileIndex}`, image.type || 'Vehicle Photo');
      if (image.row) formData.append(`imageRow_${fileIndex}`, image.row);
      if (image.column !== undefined) formData.append(`imageColumn_${fileIndex}`, String(image.column));
      fileIndex++;
    });
    return this.http.post<any>(`${this.apiUrl}/admin/vehicles/${Number(carId)}/images`, formData, { headers: this.getAuthHeaders() });
  }

  generateInspectionReportPdf(reportId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/inspection-reports/${Number(reportId)}/pdf`, { headers: this.getHeaders() });
  }

  getRequestReport(requestId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inspection-requests/request/${Number(requestId)}/report`, { headers: this.getHeaders() });
  }

  getRequestByReportId(reportId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inspection-requests/report/${Number(reportId)}/request`, { headers: this.getHeaders() });
  }
}
