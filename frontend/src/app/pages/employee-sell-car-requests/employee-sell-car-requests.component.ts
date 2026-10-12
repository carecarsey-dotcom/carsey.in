import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../services/employee.service';

interface SellCarImageField {
  key: string;
  label: string;
  dbKey: string;
}

@Component({
  selector: 'app-employee-sell-car-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-sell-car-requests.component.html'
})
export class EmployeeSellCarRequestsComponent implements OnInit {

  constructor(
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadSellCarRequests();
  }

  // =====================================================
  // SELL CAR REQUESTS
  // =====================================================

  sellCarRequests: any[] = [];

  sellCarLoading = false;

  sellCarError = '';

  sellCarSuccess = '';

  editingSellCarId: number | null = null;

  sellCarForm: any = {};

  // =====================================================
  // EIGHT VEHICLE IMAGE FIELDS
  // =====================================================

  readonly sellCarImageFields: SellCarImageField[] = [

    {
      key: 'frontImage',
      label: 'Front View',
      dbKey: 'front_image'
    },

    {
      key: 'backImage',
      label: 'Back View',
      dbKey: 'back_image'
    },

    {
      key: 'leftImage',
      label: 'Left View',
      dbKey: 'left_image'
    },

    {
      key: 'rightImage',
      label: 'Right View',
      dbKey: 'right_image'
    },

    {
      key: 'interiorFrontImage',
      label: 'Interior Front Seat',
      dbKey: 'interior_front_image'
    },

    {
      key: 'interiorRearImage',
      label: 'Interior Rear Seat',
      dbKey: 'interior_rear_image'
    },

    {
      key: 'odometerImage',
      label: 'Odometer',
      dbKey: 'odometer_image'
    },

    {
      key: 'extraImage',
      label: 'Additional Image',
      dbKey: 'extra_image'
    }

  ];

  // =====================================================
  // SELECTED IMAGE FILES
  // =====================================================

  sellCarImages: Record<string, File | null> = {

    frontImage: null,

    backImage: null,

    leftImage: null,

    rightImage: null,

    interiorFrontImage: null,

    interiorRearImage: null,

    odometerImage: null,

    extraImage: null

  };

  // Image removals are applied when the employee saves the form.
  sellCarImagesToRemove = new Set<string>();

  // Temporary preview URLs for newly selected images.
  selectedImagePreviewUrls: Record<string, string | null> = {};

  // =====================================================
  // LOAD EMPLOYEE SELL CAR REQUESTS
  // =====================================================

  loadSellCarRequests(): void {

    this.sellCarLoading = true;

    this.sellCarError = '';

    this.employeeService.getMySellCarRequests().subscribe({

      next: (response: any) => {

        this.sellCarLoading = false;

        const data = response?.data;

        this.sellCarRequests = Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
            ? data.requests
            : [];

      },

      error: (error: any) => {

        this.sellCarLoading = false;

        this.sellCarRequests = [];

        this.sellCarError =
          error?.error?.message ||
          'Unable to load Sell Car requests.';

      }

    });

  }

  // =====================================================
  // REFRESH REQUESTS
  // =====================================================

  refreshAllRequests(): void {

    this.loadSellCarRequests();

  }

  // =====================================================
  // GET SELL CAR REQUEST ID
  // =====================================================

  getSellId(request: any): number {

    return Number(
      request?.sell_id ??
      request?.sellId ??
      0
    );

  }

  // =====================================================
  // CHECK WHETHER EMPLOYEE CAN EDIT REQUEST
  // =====================================================

  canEditSellCar(request: any): boolean {

    return [
      'Assigned',
      'Correction Required'
    ].includes(request?.workflow_status);

  }

  // =====================================================
  // RESET SELECTED IMAGE FILES
  // =====================================================

  private resetSellCarImages(): void {
 Object.values(this.selectedImagePreviewUrls).forEach((url) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
});
    this.selectedImagePreviewUrls = {};
    this.sellCarImagesToRemove.clear();

    this.sellCarImages = {
      frontImage: null,
      backImage: null,
      leftImage: null,
      rightImage: null,
      interiorFrontImage: null,
      interiorRearImage: null,
      odometerImage: null,
      extraImage: null
    };
  }


  removeSellCarImage(fieldKey: string): void {
    this.clearSelectedSellCarImage(fieldKey);
    this.sellCarImagesToRemove.add(fieldKey);
    this.sellCarError = '';
    this.sellCarSuccess = '';
  }

  undoSellCarImageRemoval(fieldKey: string): void {
    this.sellCarImagesToRemove.delete(fieldKey);
  }

  isSellCarImageMarkedForRemoval(fieldKey: string): boolean {
    return this.sellCarImagesToRemove.has(fieldKey);
  }

  clearSelectedSellCarImage(fieldKey: string): void {
    const oldUrl = this.selectedImagePreviewUrls[fieldKey];

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    delete this.selectedImagePreviewUrls[fieldKey];
    this.sellCarImages[fieldKey] = null;
  }

  getSelectedSellCarImagePreview(fieldKey: string): string {
    return this.selectedImagePreviewUrls[fieldKey] || '';
  }

  // =====================================================
  // EDIT SELL CAR REQUEST
  // =====================================================

  editSellCarRequest(request: any): void {

    if (!this.canEditSellCar(request)) {
      return;
    }

    this.editingSellCarId = this.getSellId(request);

    this.sellCarForm = {

      sellerName:
        request.seller_name ??
        request.sellerName ??
        '',

      mobile:
        request.mobile ?? '',

      email:
        request.email ?? '',

      city:
        request.city ?? '',

      brand:
        request.brand ?? '',

      model:
        request.model ?? '',

      variant:
        request.variant ?? '',

      vehicleNumber:
        request.vehicle_number ??
        request.vehicleNumber ??
        '',

      manufacturingYear:
        request.manufacturing_year ??
        request.manufacturingYear ??
        '',

      fuelType:
        request.fuel_type ??
        request.fuelType ??
        '',

      transmission:
        request.transmission ?? '',

      kmDriven:
        request.km_driven ??
        request.kmDriven ??
        '',

      expectedPrice:
        request.expected_price ??
        request.expectedPrice ??
        ''

    };

    this.resetSellCarImages();

    this.sellCarError = '';

    this.sellCarSuccess = '';

  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  cancelSellCarEdit(): void {

    this.editingSellCarId = null;

    this.resetSellCarImages();

    this.sellCarError = '';

    this.sellCarSuccess = '';

  }

  // =====================================================
  // IMAGE VALIDATION AND SELECTION
  // =====================================================

  onSellCarImageSelected(
    event: Event,
    fieldKey: string
  ): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    // Allow only common image formats.
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedImageTypes.includes(file.type.toLowerCase())) {

      this.sellCarError =
        'Please select a JPG, JPEG, PNG, or WEBP image.';

      input.value = '';

      return;
    }

    // Keep file size within the backend's 5 MB limit.
    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {

      this.sellCarError =
        'Image size must not exceed 5 MB.';

      input.value = '';

      return;
    }

    const validField = this.sellCarImageFields.some(
      field => field.key === fieldKey
    );

    if (!validField) {

      this.sellCarError =
        'Invalid vehicle image field.';

      input.value = '';

      return;
    }

    this.sellCarError = '';

    this.sellCarSuccess = '';

    this.clearSelectedSellCarImage(fieldKey);
    this.sellCarImages[fieldKey] = file;
    this.sellCarImagesToRemove.delete(fieldKey);
    this.selectedImagePreviewUrls[fieldKey] = URL.createObjectURL(file);

  }

  // =====================================================
  // GET EXISTING IMAGE PATH
  // =====================================================

  getSellCarImagePath(
    request: any,
    field: SellCarImageField
  ): string {

    return (
      request?.[field.dbKey] ||
      request?.[field.key] ||
      ''
    );

  }

  // =====================================================
  // GET IMAGE URL
  // =====================================================

  getSellCarImageUrl(path: string): string {

    if (!path) {
      return '';
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const apiBase = this.getEmployeeApiBase();

    const origin = apiBase.replace(/\/api\/?$/, '');

    return `${origin}${path.startsWith('/') ? path : '/' + path}`;

  }

  // Create a readable filename for downloading an existing vehicle image.
  getSellCarDownloadName(field: SellCarImageField, path: string): string {
    const cleanPath = (path || '').split('?')[0].split('#')[0];
    const extension = cleanPath.includes('.')
      ? cleanPath.substring(cleanPath.lastIndexOf('.'))
      : '.jpg';
    const safeLabel = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `sell-car-${safeLabel}${extension}`;
  }

  // =====================================================
  // GET API BASE URL
  // =====================================================

  private getEmployeeApiBase(): string {

    const hostname = window.location.hostname;

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {

      return 'http://localhost:5000/api';

    }

    return 'https://api.carsey.in/api';

  }

  // =====================================================
  // SAVE SELL CAR REQUEST
  // =====================================================

  saveSellCarRequest(): void {

    if (!this.editingSellCarId) {

      this.sellCarError =
        'Invalid Sell Car request ID.';

      return;
    }

    const formData = new FormData();

    // Append seller and vehicle details.
    Object.keys(this.sellCarForm).forEach(
      (key: string) => {

        formData.append(
          key,
          String(this.sellCarForm[key] ?? '').trim()
        );

      }
    );

    // Append only newly selected images.
    // Unchanged images are not re-uploaded.
    this.sellCarImageFields.forEach((field: SellCarImageField) => {
      const file = this.sellCarImages[field.key];
      if (file) {
        formData.append(field.key, file);
      }
      if (this.sellCarImagesToRemove.has(field.key)) {
        // Backend must interpret this flag by setting the corresponding DB image column to NULL.
        formData.append(`remove_${field.key}`, 'true');
      }
    });

    this.sellCarLoading = true;

    this.sellCarError = '';

    this.sellCarSuccess = '';

    this.employeeService
      .updateMySellCarRequest(
        this.editingSellCarId,
        formData
      )
      .subscribe({

        next: (response: any) => {

          this.sellCarLoading = false;

          this.sellCarSuccess =
            response?.message ||
            'Sell Car request updated successfully.';

          this.editingSellCarId = null;

          this.resetSellCarImages();

          this.loadSellCarRequests();

        },

        error: (error: any) => {

          this.sellCarLoading = false;

          this.sellCarError =
            error?.error?.message ||
            'Unable to update Sell Car request.';

        }

      });

  }

  // =====================================================
  // SUBMIT FOR ADMIN APPROVAL
  // =====================================================

  submitSellCarForApproval(request: any): void {

    const sellId = this.getSellId(request);

    if (!sellId) {

      this.sellCarError =
        'Invalid Sell Car request ID.';

      return;
    }

    if (this.editingSellCarId === sellId) {

      this.sellCarError =
        'Please save or cancel your changes before submitting for approval.';

      return;
    }

    if (
      !window.confirm(
        'Submit this Sell Car request for Admin approval?'
      )
    ) {
      return;
    }

    this.sellCarLoading = true;

    this.sellCarError = '';

    this.sellCarSuccess = '';

    this.employeeService
      .submitMySellCarRequest(sellId)
      .subscribe({

        next: (response: any) => {

          this.sellCarLoading = false;

          this.sellCarSuccess =
            response?.message ||
            'Request submitted for Admin approval.';

          this.loadSellCarRequests();

        },

        error: (error: any) => {

          this.sellCarLoading = false;

          this.sellCarError =
            error?.error?.message ||
            'Unable to submit request for approval.';

        }

      });

  }

}