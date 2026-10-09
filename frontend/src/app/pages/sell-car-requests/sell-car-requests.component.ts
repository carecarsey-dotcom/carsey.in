import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SellCarRequest, SellCarService } from '../../services/sell-car.service';

@Component({
  selector: 'app-sell-car-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sell-car-requests.component.html',
  styleUrl: './sell-car-requests.component.css'
})
export class SellCarRequestsComponent implements OnInit {
  private sellCarService = inject(SellCarService);

  requests: SellCarRequest[] = [];
  loading = false;
  errorMessage = '';
  updatingSellId: number | null = null;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.sellCarService.getRequests().subscribe({
      next: (response) => {
        console.log('Sell Car Requests:', response);
        if (response.success) {
          this.requests = response.data?.requests ?? [];
        } else {
          this.errorMessage = response.message || 'Unable to load sell car requests.';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Sell Car API Error:', error);
        this.errorMessage = error?.error?.message || 'Unable to load sell car requests.';
        this.loading = false;
      }
    });
  }

  approve(request: SellCarRequest): void {
    this.updateStatus(request, 'Approved');
  }

  reject(request: SellCarRequest): void {
    this.updateStatus(request, 'Rejected');
  }

  private updateStatus(request: SellCarRequest, status: 'Approved' | 'Rejected'): void {
    this.updatingSellId = request.sell_id;
    this.sellCarService.updateStatus(request.sell_id, status).subscribe({
      next: (response) => {
        if (response.success) {
          request.status = status;
        } else {
          alert(response.message || 'Unable to update sell car status.');
        }
        this.updatingSellId = null;
      },
      error: (error) => {
        console.error('Update Sell Car Error:', error);
        alert(error?.error?.message || 'Unable to update sell car status.');
        this.updatingSellId = null;
      }
    });
  }

  getStatusClass(status?: string): string {
    if (status === 'Approved') return 'bg-green-100 text-green-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  getImageUrl(image?: string): string {
    if (!image) return '';
    if (/^https?:\/\//i.test(image)) return image;

    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://api.carsey.in';
    return `${baseUrl}${cleanPath}`;
  }

  getRequestImages(request: SellCarRequest): { label: string; path?: string }[] {
    return [
      { label: 'Front', path: request.front_image },
      { label: 'Back', path: request.back_image },
      { label: 'Left Side', path: request.left_image },
      { label: 'Right Side', path: request.right_image },
      { label: 'Interior – Front', path: request.interior_front_image },
      { label: 'Interior – Rear', path: request.interior_rear_image },
      { label: 'Open Dicky', path: request.open_dicky_image },
      { label: 'Open Bonnet', path: request.open_bonnet_image },
      { label: 'Odometer', path: request.odometer_image },
      { label: 'Dashboard', path: request.dashboard_image }
    ];
  }
}
