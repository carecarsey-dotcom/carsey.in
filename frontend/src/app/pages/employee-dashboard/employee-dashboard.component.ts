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
                ? response.data.map(
                    (request: any) =>
                      this.normalizeRequest(request)
                  )
                : [];

          } else {

            this.requests =
              Array.isArray(response?.data)
                ? response.data.map(
                    (request: any) =>
                      this.normalizeRequest(request)
                  )
                : [];

          }

          console.log(
            'Employee normalized requests:',
            this.requests
          );

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
  // NORMALIZE REQUEST DATA
  // =====================================================

  normalizeRequest(
    request: any
  ): any {

    if (!request) {
      return {};
    }

    return {
      ...request,

      // -------------------------------------------------
      // CITY
      // -------------------------------------------------

      city:
        request?.city ||
        request?.booking_city ||
        request?.customer_city ||
        '',

      // -------------------------------------------------
      // BOOKING DATE
      // -------------------------------------------------

      booking_date:
        request?.booking_date ||
        request?.bookingDate ||
        request?.inspection_date ||
        request?.inspectionDate ||
        '',

      // -------------------------------------------------
      // TIME SLOT
      // -------------------------------------------------

      time_slot:
        request?.time_slot ||
        request?.timeSlot ||
        request?.booking_time ||
        request?.bookingTime ||
        request?.inspection_time ||
        request?.inspectionTime ||
        ''
    };
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

  // =====================================================
  // CITY
  // =====================================================

  getCity(
    request: any
  ): string {

    const city =
      request?.city ||
      request?.booking_city ||
      request?.customer_city ||
      '';

    return String(city).trim() || '-';
  }

  // =====================================================
  // ADDRESS
  // =====================================================

  getAddress(
    request: any
  ): string {

    return (
      request?.address ||
      request?.customer_address ||
      '-'
    );
  }

  // =====================================================
  // BOOKING DATE
  // =====================================================

  getBookingDate(
    request: any
  ): string {

    const value =
      request?.booking_date ||
      request?.bookingDate ||
      request?.inspection_date ||
      request?.inspectionDate;

    if (!value) {
      return '-';
    }

    const dateString =
      String(value).trim();

    // -------------------------------------------------
    // YYYY-MM-DD
    // -------------------------------------------------

    const dateMatch =
      dateString.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

    if (dateMatch) {

      return (
        `${dateMatch[3]}/` +
        `${dateMatch[2]}/` +
        `${dateMatch[1]}`
      );
    }

    // -------------------------------------------------
    // DD-MM-YYYY
    // -------------------------------------------------

    const indianDateMatch =
      dateString.match(
        /^(\d{2})-(\d{2})-(\d{4})/
      );

    if (indianDateMatch) {

      return (
        `${indianDateMatch[1]}/` +
        `${indianDateMatch[2]}/` +
        `${indianDateMatch[3]}`
      );
    }

    // -------------------------------------------------
    // ISO / DATE OBJECT FALLBACK
    // -------------------------------------------------

    const parsedDate =
      new Date(dateString);

    if (
      !isNaN(
        parsedDate.getTime()
      )
    ) {

      const day =
        String(
          parsedDate.getDate()
        ).padStart(2, '0');

      const month =
        String(
          parsedDate.getMonth() + 1
        ).padStart(2, '0');

      const year =
        parsedDate.getFullYear();

      return (
        `${day}/${month}/${year}`
      );
    }

    return dateString;
  }

  // =====================================================
  // TIME SLOT
  // =====================================================

  getTimeSlot(
    request: any
  ): string {

    const value =
      request?.time_slot ||
      request?.timeSlot ||
      request?.booking_time ||
      request?.bookingTime ||
      request?.inspection_time ||
      request?.inspectionTime;

    if (!value) {
      return '-';
    }

    const timeSlot =
      String(value).trim();

    if (!timeSlot) {
      return '-';
    }

    // -------------------------------------------------
    // ALREADY FORMATTED
    // Example:
    // 09:00 AM - 11:00 AM
    // -------------------------------------------------

    if (
      /AM|PM/i.test(timeSlot)
    ) {

      return timeSlot;
    }

    // -------------------------------------------------
    // TIME RANGE
    // Examples:
    // 09:00 - 11:00
    // 09:00:00 - 11:00:00
    // -------------------------------------------------

    const parts =
      timeSlot
        .split(
          /\s*-\s*/
        );

    if (
      parts.length !== 2
    ) {

      return timeSlot;
    }

    const formatTime =
      (
        time: string
      ): string => {

        const cleanTime =
          time.trim();

        const match =
          cleanTime.match(
            /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
          );

        if (!match) {
          return cleanTime;
        }

        let hour =
          Number(match[1]);

        const minute =
          match[2];

        const period =
          hour >= 12
            ? 'PM'
            : 'AM';

        if (hour === 0) {

          hour = 12;

        } else if (hour > 12) {

          hour -= 12;
        }

        return (
          `${String(hour).padStart(2, '0')}:` +
          `${minute} ${period}`
        );
      };

    return (
      `${formatTime(parts[0])} - ` +
      `${formatTime(parts[1])}`
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