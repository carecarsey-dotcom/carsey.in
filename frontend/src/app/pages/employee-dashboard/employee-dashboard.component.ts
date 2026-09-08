import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  EmployeeService
} from '../../services/employee.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './employee-dashboard.component.html',
  // styleUrl:
  //   './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent
  implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  requests: any[] = [];

  loading = false;

  errorMessage = '';

  successMessage = '';

  // =====================================================
  // COUNTS
  // =====================================================

  assignedCount = 0;

  acceptedCount = 0;

  inProgressCount = 0;

  submittedCount = 0;

  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadRequests();
  }

  // =====================================================
  // LOAD EMPLOYEE REQUESTS
  // =====================================================

  loadRequests(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.employeeService
      .getMyRequests()
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          console.log(
            'Employee requests response:',
            response
          );

          // -------------------------------------------------
          // BACKEND RESPONSE
          // -------------------------------------------------

          if (
            response &&
            response.success
          ) {

            this.requests =
              Array.isArray(response.data)
                ? response.data
                : [];

          } else {

            this.requests =
              Array.isArray(response?.data)
                ? response.data
                : [];

          }

          // -------------------------------------------------
          // CALCULATE COUNTS
          // -------------------------------------------------

          this.calculateCounts();
        },

        error: (error: any) => {

          this.loading = false;

          console.error(
            'Employee requests error:',
            error
          );

          this.requests = [];

          this.calculateCounts();

          this.errorMessage =
            error?.error?.message ||
            'Unable to load inspection requests.';
        }

      });
  }

  // =====================================================
  // REFRESH
  // =====================================================

  refreshRequests(): void {

    this.loadRequests();
  }

  // =====================================================
  // COUNTS
  // =====================================================

  calculateCounts(): void {

    const requests =
      Array.isArray(this.requests)
        ? this.requests
        : [];

    this.assignedCount =
      requests.filter(
        (request: any) =>
          request?.status === 'Assigned'
      ).length;

    this.acceptedCount =
      requests.filter(
        (request: any) =>
          request?.status === 'Accepted'
      ).length;

    this.inProgressCount =
      requests.filter(
        (request: any) =>
          request?.status === 'In Progress'
      ).length;

    this.submittedCount =
      requests.filter(
        (request: any) =>
          request?.status === 'Submitted'
      ).length;
  }

  // =====================================================
  // OPEN INSPECTION
  // =====================================================

  openInspection(
    request: any
  ): void {

    if (!request?.request_id) {
      return;
    }

    this.router.navigate([
      '/employee/inspection',
      request.request_id
    ]);
  }

  // =====================================================
  // ACCEPT REQUEST
  // =====================================================

  acceptRequest(
    request: any
  ): void {

    if (!request?.request_id) {
      return;
    }

    if (request.status !== 'Assigned') {

      this.errorMessage =
        'This inspection request cannot be accepted now.';

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.employeeService
      .acceptRequest(
        request.request_id
      )
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          console.log(
            'Accept request response:',
            response
          );

          this.successMessage =
            response?.message ||
            'Inspection request accepted successfully.';

          // -------------------------------------------------
          // RELOAD REAL BACKEND DATA
          // -------------------------------------------------

          this.loadRequests();
        },

        error: (error: any) => {

          this.loading = false;

          console.error(
            'Accept request error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to accept inspection request.';
        }

      });
  }

  // =====================================================
  // REJECT REQUEST
  // =====================================================

  rejectRequest(
    request: any
  ): void {

    if (!request?.request_id) {
      return;
    }

    if (request.status !== 'Assigned') {

      this.errorMessage =
        'This inspection request cannot be rejected now.';

      return;
    }

    const remark =
      window.prompt(
        'Enter rejection reason:',
        ''
      );

    // -----------------------------------------------------
    // USER CANCELLED
    // -----------------------------------------------------

    if (remark === null) {
      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.employeeService
      .rejectRequest(
        request.request_id,
        remark.trim()
      )
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          console.log(
            'Reject request response:',
            response
          );

          this.successMessage =
            response?.message ||
            'Inspection request rejected.';

          // -------------------------------------------------
          // RELOAD REAL BACKEND DATA
          // -------------------------------------------------

          this.loadRequests();
        },

        error: (error: any) => {

          this.loading = false;

          console.error(
            'Reject request error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to reject inspection request.';
        }

      });
  }

  // =====================================================
  // START INSPECTION
  // =====================================================

  startInspection(
    request: any
  ): void {

    if (!request?.request_id) {
      return;
    }

    if (request.status !== 'Accepted') {

      this.errorMessage =
        'Inspection can only be started after accepting the request.';

      return;
    }

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.employeeService
      .startInspection(
        request.request_id
      )
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          console.log(
            'Start inspection response:',
            response
          );

          this.successMessage =
            response?.message ||
            'Inspection started successfully.';

          // -------------------------------------------------
          // OPEN INSPECTION FORM
          // -------------------------------------------------

          this.router.navigate([
            '/employee/inspection',
            request.request_id
          ]);
        },

        error: (error: any) => {

          this.loading = false;

          console.error(
            'Start inspection error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to start inspection.';
        }

      });
  }

  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'Assigned':
        return 'bg-amber-100 text-amber-700';

      case 'Accepted':
        return 'bg-blue-100 text-blue-700';

      case 'In Progress':
        return 'bg-purple-100 text-purple-700';

      case 'Submitted':
        return 'bg-orange-100 text-orange-700';

      case 'Rejected':
        return 'bg-red-100 text-red-700';

      case 'Admin Rejected':
        return 'bg-rose-100 text-rose-700';

      case 'Approved':
        return 'bg-green-100 text-green-700';

      case 'Published':
        return 'bg-emerald-100 text-emerald-700';

      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // =====================================================
  // STATUS TEXT
  // =====================================================

  getStatusText(
    status: string
  ): string {

    switch (status) {

      case 'Assigned':
        return 'New Request';

      case 'Accepted':
        return 'Accepted';

      case 'In Progress':
        return 'Inspection In Progress';

      case 'Submitted':
        return 'Submitted for Admin Review';

      case 'Rejected':
        return 'Rejected';

      case 'Admin Rejected':
        return 'Correction Required';

      case 'Approved':
        return 'Approved by Admin';

      case 'Published':
        return 'Published';

      default:
        return status || 'Unknown';
    }
  }

  // =====================================================
  // BUTTON HELPERS
  // =====================================================

  canAccept(
    request: any
  ): boolean {

    return request?.status === 'Assigned';
  }

  canReject(
    request: any
  ): boolean {

    return request?.status === 'Assigned';
  }

  canStart(
    request: any
  ): boolean {

    return request?.status === 'Accepted';
  }

  canOpenInspection(
    request: any
  ): boolean {

    return (
      request?.status === 'Accepted' ||
      request?.status === 'In Progress'
    );
  }

  // =====================================================
  // SAFE DISPLAY HELPERS
  // =====================================================

  getCustomerName(
    request: any
  ): string {

    return (
      request?.name ||
      request?.customer_name ||
      request?.customerName ||
      'Customer'
    );
  }

  getMobile(
    request: any
  ): string {

    return (
      request?.mobile ||
      request?.phone ||
      request?.customer_mobile ||
      '-'
    );
  }

  getEmail(
    request: any
  ): string {

    return (
      request?.email ||
      request?.customer_email ||
      '-'
    );
  }

  getVehicleNumber(
    request: any
  ): string {

    return (
      request?.vehicle_number ||
      request?.registration_number ||
      request?.vehicleNumber ||
      '-'
    );
  }

  getVehicleName(
    request: any
  ): string {

    const brand =
      request?.brand ||
      '';

    const model =
      request?.model ||
      '';

    const vehicle =
      `${brand} ${model}`.trim();

    return vehicle || '-';
  }

  getCity(
    request: any
  ): string {

    return (
      request?.city ||
      '-'
    );
  }

  getAddress(
    request: any
  ): string {

    return (
      request?.address ||
      '-'
    );
  }

  getBookingDate(
    request: any
  ): string {

    return (
      request?.booking_date ||
      request?.bookingDate ||
      '-'
    );
  }

  getTimeSlot(
    request: any
  ): string {

    return (
      request?.time_slot ||
      request?.timeSlot ||
      '-'
    );
  }

  // =====================================================
  // TRACK REQUEST ID
  // =====================================================

  getRequestId(
    request: any
  ): number | null {

    if (!request?.request_id) {
      return null;
    }

    return Number(
      request.request_id
    );
  }

  // =====================================================
  // TRACK BOOKING ID
  // =====================================================

  getBookingId(
    request: any
  ): number | null {

    if (!request?.booking_id) {
      return null;
    }

    return Number(
      request.booking_id
    );
  }

  // =====================================================
  // TRACK REPORT ID
  // =====================================================

  getReportId(
    request: any
  ): number | null {

    if (!request?.report_id) {
      return null;
    }

    return Number(
      request.report_id
    );
  }
}