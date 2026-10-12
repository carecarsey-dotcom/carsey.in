import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-sell-car-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-sell-car-requests.component.html'
})
export class EmployeeSellCarRequestsComponent implements OnInit {
  constructor(private employeeService: EmployeeService) {}
  ngOnInit(): void { this.loadSellCarRequests(); }

  sellCarRequests: any[] = [];
  sellCarLoading = false;
  sellCarError = '';
  sellCarSuccess = '';
  editingSellCarId: number | null = null;
  sellCarForm: any = {};

  readonly sellCarImageFields = [
    { key: 'frontImage', label: 'Front View', dbKey: 'front_image' },
    { key: 'backImage', label: 'Rear / Back View', dbKey: 'back_image' },
    { key: 'leftImage', label: 'Left View', dbKey: 'left_image' },
    { key: 'rightImage', label: 'Right View', dbKey: 'right_image' }
  ];

  sellCarImages: Record<string, File | null> = {
    frontImage: null,
    backImage: null,
    leftImage: null,
    rightImage: null
  };

  loadSellCarRequests(): void {
    this.sellCarLoading = true;
    this.sellCarError = '';

    this.employeeService.getMySellCarRequests().subscribe({
      next: (response: any) => {
        this.sellCarLoading = false;
        const data = response?.data;
        this.sellCarRequests = Array.isArray(data)
          ? data
          : Array.isArray(data?.requests) ? data.requests : [];
      },
      error: (error: any) => {
        this.sellCarLoading = false;
        this.sellCarRequests = [];
        this.sellCarError = error?.error?.message || 'Unable to load Sell Car requests.';
      }
    });
  }

  refreshAllRequests(): void { this.loadSellCarRequests(); }

  getSellId(request: any): number {
    return Number(request?.sell_id ?? request?.sellId ?? 0);
  }

  canEditSellCar(request: any): boolean {
    return ['Assigned', 'Correction Required'].includes(request?.workflow_status);
  }

  editSellCarRequest(request: any): void {
    if (!this.canEditSellCar(request)) return;
    this.editingSellCarId = this.getSellId(request);
    this.sellCarForm = {
      sellerName: request.seller_name ?? request.sellerName ?? '',
      mobile: request.mobile ?? '',
      email: request.email ?? '',
      city: request.city ?? '',
      brand: request.brand ?? '',
      model: request.model ?? '',
      variant: request.variant ?? '',
      vehicleNumber: request.vehicle_number ?? request.vehicleNumber ?? '',
      manufacturingYear: request.manufacturing_year ?? request.manufacturingYear ?? '',
      fuelType: request.fuel_type ?? request.fuelType ?? '',
      transmission: request.transmission ?? '',
      kmDriven: request.km_driven ?? request.kmDriven ?? '',
      expectedPrice: request.expected_price ?? request.expectedPrice ?? ''
    };
    this.sellCarImages = Object.fromEntries(this.sellCarImageFields.map((f: any) => [f.key, null]));
    this.sellCarError = '';
    this.sellCarSuccess = '';
  }

  cancelSellCarEdit(): void {
    this.editingSellCarId = null;
    this.sellCarImages = Object.fromEntries(this.sellCarImageFields.map((f: any) => [f.key, null]));
  }

  onSellCarImageSelected(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.sellCarError = 'Please select a valid image file.';
      input.value = '';
      return;
    }
    this.sellCarError = '';
    this.sellCarImages[fieldKey] = file;
  }

  getSellCarImagePath(request: any, field: any): string {
    return request?.[field.dbKey] || request?.[field.key] || '';
  }

  getSellCarImageUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = this.getEmployeeApiBase();
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${path.startsWith('/') ? path : '/' + path}`;
  }

  saveSellCarRequest(): void {
    if (!this.editingSellCarId) {
      this.sellCarError = 'Invalid Sell Car request ID.';
      return;
    }

    const formData = new FormData();
    Object.keys(this.sellCarForm).forEach((key: string) => {
      formData.append(key, String(this.sellCarForm[key] ?? '').trim());
    });
    this.sellCarImageFields.forEach((field: any) => {
      const file = this.sellCarImages[field.key];
      if (file) formData.append(field.key, file);
    });

    this.sellCarLoading = true;
    this.sellCarError = '';
    this.sellCarSuccess = '';
    this.employeeService.updateMySellCarRequest(this.editingSellCarId, formData).subscribe({
      next: (response: any) => {
        this.sellCarLoading = false;
        this.sellCarSuccess = response?.message || 'Sell Car request updated successfully.';
        this.editingSellCarId = null;
        this.loadSellCarRequests();
      },
      error: (error: any) => {
        this.sellCarLoading = false;
        this.sellCarError = error?.error?.message || 'Unable to update Sell Car request.';
      }
    });
  }

  submitSellCarForApproval(request: any): void {
    const sellId = this.getSellId(request);
    if (!sellId) {
      this.sellCarError = 'Invalid Sell Car request ID.';
      return;
    }
    if (!window.confirm('Submit this Sell Car request for Admin approval?')) return;

    this.sellCarLoading = true;
    this.sellCarError = '';
    this.sellCarSuccess = '';
    this.employeeService.submitMySellCarRequest(sellId).subscribe({
      next: (response: any) => {
        this.sellCarLoading = false;
        this.sellCarSuccess = response?.message || 'Request submitted for Admin approval.';
        this.loadSellCarRequests();
      },
      error: (error: any) => {
        this.sellCarLoading = false;
        this.sellCarError = error?.error?.message || 'Unable to submit request for approval.';
      }
    });
  }

  // Uses the same API base as EmployeeService; update this origin for production deployments.
  private getEmployeeApiBase(): string {
    return 'http://localhost:5000/api';
  }
}
