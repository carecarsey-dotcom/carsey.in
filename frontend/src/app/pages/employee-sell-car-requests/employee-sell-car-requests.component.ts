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

    this.sellCarImages[fieldKey] = file;

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
    this.sellCarImageFields.forEach(
      (field: SellCarImageField) => {

        const file = this.sellCarImages[field.key];

        if (file) {

          formData.append(field.key, file);

        }

      }
    );

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