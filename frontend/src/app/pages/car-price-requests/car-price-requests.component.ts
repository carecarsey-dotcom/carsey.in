import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';

import {
  CarPriceRequest,
  CarPriceRequestStatus,
  CarPriceRequestsResponse,
  CarPriceRequestsService
} from '../../services/car-price-requests.service';

@Component({
  selector: 'app-car-price-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-price-requests.component.html',
  styleUrl: './car-price-requests.component.css'
})
export class CarPriceRequestsComponent implements OnInit {
  private readonly service = inject(CarPriceRequestsService);

  requests: CarPriceRequest[] = [];
  loading = false;
  errorMessage = '';
  updatingRequestId: number | null = null;

  ngOnInit(): void {
    this.loadRequests();
  }

  // ==========================================
  // LOAD ALL CAR PRICE REQUESTS
  // ==========================================
  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getRequests().subscribe({
      next: (response: CarPriceRequestsResponse) => {
        if (response.success) {
          this.requests = response.data?.requests ?? [];
        } else {
          this.errorMessage =
            response.message || 'Unable to load car price requests.';
        }

        this.loading = false;
      },

      error: (error: HttpErrorResponse) => {
        console.error('Car Price Requests API Error:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load car price requests. Check the API route and server.';

        this.loading = false;
      }
    });
  }

  // ==========================================
  // UPDATE REQUEST STATUS
  // ==========================================
  updateStatus(
    request: CarPriceRequest,
    status: CarPriceRequestStatus
  ): void {
    this.updatingRequestId = request.request_id;

    this.service
      .updateStatus(request.request_id, status)
      .subscribe({
        next: (response: CarPriceRequestsResponse) => {
          if (response.success) {
            request.status = status;
          } else {
            alert(
              response.message || 'Unable to update request status.'
            );
          }

          this.updatingRequestId = null;
        },

        error: (error: HttpErrorResponse) => {
          console.error('Update Car Price Request Error:', error);

          alert(
            error.error?.message ||
              'Unable to update request status.'
          );

          this.updatingRequestId = null;
        }
      });
  }

  // ==========================================
  // STATUS BADGE CSS
  // ==========================================
  getStatusClass(status?: string): string {
    if (status === 'Contacted') {
      return 'bg-blue-100 text-blue-700';
    }

    if (status === 'Closed') {
      return 'bg-slate-200 text-slate-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  }

  // ==========================================
  // VEHICLE LABEL
  // ==========================================
  getCarLabel(request: CarPriceRequest): string {
    const details = [
      request.brand,
      request.model,
      request.variant
    ]
      .filter(Boolean)
      .join(' ');

    return details || `Car ID: ${request.car_id}`;
  }
}