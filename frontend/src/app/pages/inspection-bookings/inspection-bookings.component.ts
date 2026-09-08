import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  InspectionBookingService
} from '../../services/inspection-booking.service';


// ======================================================
// INSPECTION BOOKING INTERFACE
// ======================================================

interface InspectionBooking {

  booking_id: number;

  name: string;

  mobile: string;

  email: string;

  city: string;

  vehicle_number: string;

  brand: string;

  model: string;

  address: string;

  booking_date: string;

  time_slot: string;

  status: 'Pending' | 'Approved' | 'Rejected' | string;

  created_at: string;

  // ====================================================
  // INSPECTION REQUEST DATA
  // ====================================================

  inspection_request_id?: number;

  inspection_request_status?: string;

  employee_id?: number;

  employee_name?: string;

  employee_email?: string;

}


// ======================================================
// EMPLOYEE INTERFACE
// ======================================================

interface Employee {

  admin_id: number;

  name: string;

  email: string;

  role: string;

  status: string;

}


@Component({

  selector:
    'app-inspection-bookings',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl:
    './inspection-bookings.component.html',

  styleUrl:
    './inspection-bookings.component.css'

})


export class InspectionBookingsComponent
  implements OnInit {


  // ======================================================
  // SERVICE
  // ======================================================

  private readonly bookingService =
    inject(
      InspectionBookingService
    );


  // ======================================================
  // DATA
  // ======================================================

  bookings:
    InspectionBooking[] = [];


  filteredBookings:
    InspectionBooking[] = [];


  // ======================================================
  // EMPLOYEES
  // ======================================================

  employees:
    Employee[] = [];


  employeesLoading = false;


  employeeErrorMessage = '';


  // ======================================================
  // ASSIGNMENT
  // ======================================================

  assigningBookingId:
    number | null = null;


  selectedEmployeeByBooking:
    {
      [bookingId: number]: number | null;
    } = {};


  // ======================================================
  // SEARCH
  // ======================================================

  searchText = '';


  // ======================================================
  // LOADING
  // ======================================================

  loading = false;


  // ======================================================
  // ERROR
  // ======================================================

  errorMessage = '';


  // ======================================================
  // INITIAL LOAD
  // ======================================================

  ngOnInit(): void {

    this.loadEmployees();

    this.loadBookings();

  }


  // ======================================================
  // LOAD EMPLOYEES
  // ======================================================

  loadEmployees(): void {

    this.employeesLoading = true;

    this.employeeErrorMessage = '';


    this.bookingService
      .getEmployees()
      .subscribe({

        next: (response: any) => {

          console.log(
            'EMPLOYEES API RESPONSE:',
            response
          );


          if (
            response?.success === false
          ) {

            this.employeeErrorMessage =
              response?.message ||
              'Unable to load employees.';

            this.employees = [];

            this.employeesLoading = false;

            return;

          }


          // ==================================================
          // HANDLE DIFFERENT API RESPONSE STRUCTURES
          // ==================================================

          const data =
            response?.data;


          let employees: any[] = [];


          if (
            Array.isArray(data)
          ) {

            employees = data;

          }

          else if (
            Array.isArray(data?.employees)
          ) {

            employees =
              data.employees;

          }

          else if (
            Array.isArray(response?.employees)
          ) {

            employees =
              response.employees;

          }


          // ==================================================
          // ONLY ACTIVE EMPLOYEES
          // ==================================================

          this.employees =
            employees
              .map(
                (employee: any) =>
                  this.normalizeEmployee(
                    employee
                  )
              )
              .filter(
                (employee: Employee) =>
                  employee.role === 'Employee' &&
                  employee.status === 'Active'
              );


          this.employeesLoading = false;

        },


        error: (error) => {

          console.error(
            'GET EMPLOYEES ERROR:',
            error
          );


          this.employeeErrorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load employees.';


          this.employees = [];

          this.employeesLoading = false;

        }

      });

  }


  // ======================================================
  // NORMALIZE EMPLOYEE
  // ======================================================

  private normalizeEmployee(
    employee: any
  ): Employee {

    return {

      admin_id:
        employee?.admin_id ??
        employee?.employee_id ??
        employee?.employeeId ??
        employee?.id ??
        0,


      name:
        employee?.name ??
        employee?.employee_name ??
        employee?.employeeName ??
        '',


      email:
        employee?.email ??
        employee?.employee_email ??
        '',


      role:
        employee?.role ??
        'Employee',


      status:
        employee?.status ??
        'Active'

    };

  }


  // ======================================================
  // LOAD BOOKINGS
  // ======================================================

  loadBookings(): void {

    this.loading = true;

    this.errorMessage = '';


    this.bookingService
      .getAllBookings()
      .subscribe({

        next: (response: any) => {

          console.log(
            'BOOKINGS API RESPONSE:',
            response
          );


          if (
            response?.success === false
          ) {

            this.errorMessage =
              response?.message ||
              'Unable to load bookings.';

            this.bookings = [];

            this.filteredBookings = [];

            this.loading = false;

            return;

          }


          // ==================================================
          // HANDLE API RESPONSE
          // ==================================================

          const data =
            response?.data;


          let bookings: any[] = [];


          if (
            Array.isArray(data)
          ) {

            bookings = data;

          }

          else if (
            Array.isArray(data?.bookings)
          ) {

            bookings =
              data.bookings;

          }

          else if (
            Array.isArray(response?.bookings)
          ) {

            bookings =
              response.bookings;

          }


          this.bookings =
            bookings.map(
              (booking: any) =>
                this.normalizeBooking(
                  booking
                )
            );


          this.filteredBookings =
            [...this.bookings];


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'GET BOOKINGS ERROR:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load inspection bookings.';


          this.bookings = [];

          this.filteredBookings = [];

          this.loading = false;

        }

      });

  }


  // ======================================================
  // NORMALIZE BOOKING
  // ======================================================

  private normalizeBooking(
    booking: any
  ): InspectionBooking {

    return {

      booking_id:
        booking?.booking_id ??
        booking?.bookingId ??
        0,


      name:
        booking?.name ??
        '',


      mobile:
        booking?.mobile ??
        '',


      email:
        booking?.email ??
        '',


      city:
        booking?.city ??
        '',


      vehicle_number:
        booking?.vehicle_number ??
        booking?.vehicleNumber ??
        '',


      brand:
        booking?.brand ??
        '',


      model:
        booking?.model ??
        '',


      address:
        booking?.address ??
        '',


      booking_date:
        booking?.booking_date ??
        booking?.bookingDate ??
        '',


      time_slot:
        booking?.time_slot ??
        booking?.timeSlot ??
        '',


      status:
        booking?.status ??
        'Pending',


      created_at:
        booking?.created_at ??
        booking?.createdAt ??
        '',


      // ==================================================
      // INSPECTION REQUEST
      // ==================================================

      inspection_request_id:
        booking?.inspection_request_id ??
        booking?.request_id ??
        booking?.inspectionRequestId ??
        undefined,


      inspection_request_status:
        booking?.inspection_request_status ??
        booking?.request_status ??
        booking?.inspectionRequestStatus ??
        undefined,


      employee_id:
        booking?.employee_id ??
        booking?.employeeId ??
        undefined,


      employee_name:
        booking?.employee_name ??
        booking?.employeeName ??
        undefined,


      employee_email:
        booking?.employee_email ??
        booking?.employeeEmail ??
        undefined

    };

  }


  // ======================================================
  // SEARCH
  // ======================================================

  searchBookings(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredBookings =
        [...this.bookings];

      return;

    }


    this.filteredBookings =
      this.bookings.filter(
        (booking) => {

          return (

            String(
              booking.booking_id
            )
              .toLowerCase()
              .includes(search)


            ||


            booking.name
              .toLowerCase()
              .includes(search)


            ||


            booking.mobile
              .toLowerCase()
              .includes(search)


            ||


            booking.email
              .toLowerCase()
              .includes(search)


            ||


            booking.city
              .toLowerCase()
              .includes(search)


            ||


            booking.vehicle_number
              .toLowerCase()
              .includes(search)


            ||


            booking.brand
              .toLowerCase()
              .includes(search)


            ||


            booking.model
              .toLowerCase()
              .includes(search)

          );

        }

      );

  }


  // ======================================================
  // REFRESH
  // ======================================================

  refresh(): void {

    this.searchText = '';

    this.loadEmployees();

    this.loadBookings();

  }


  // ======================================================
  // VIEW BOOKING
  // ======================================================

  viewBooking(
    bookingId: number
  ): void {

    this.bookingService
      .getBookingById(
        bookingId
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'VIEW BOOKING API RESPONSE:',
            response
          );


          if (
            response?.success === false
          ) {

            alert(
              response?.message ||
              'Unable to fetch booking details.'
            );

            return;

          }


          // ==================================================
          // IMPORTANT
          // ==================================================

          const booking =
            response?.data?.booking ||
            response?.data;


          console.log(
            'BOOKING OBJECT:',
            booking
          );


          if (!booking) {

            alert(
              'Booking data not found.'
            );

            return;

          }


          // ==================================================
          // SHOW BOOKING DETAILS
          // ==================================================

          alert(

`Booking #${
  booking?.booking_id ??
  booking?.bookingId ??
  '-'
}

Name: ${
  booking?.name ??
  '-'
}

Mobile: ${
  booking?.mobile ??
  '-'
}

Email: ${
  booking?.email ??
  '-'
}

City: ${
  booking?.city ??
  '-'
}

Vehicle: ${
  booking?.brand ??
  '-'
} ${
  booking?.model ??
  ''
}

Vehicle Number: ${
  booking?.vehicle_number ??
  booking?.vehicleNumber ??
  '-'
}

Address: ${
  booking?.address ??
  '-'
}

Booking Date: ${
  booking?.booking_date ??
  booking?.bookingDate ??
  '-'
}

Time Slot: ${
  booking?.time_slot ??
  booking?.timeSlot ??
  '-'
}

Status: ${
  booking?.status ??
  '-'
}

Employee: ${
  booking?.employee_name ??
  booking?.employeeName ??
  'Not Assigned'
}`

          );

        },


        error: (error) => {

          console.error(
            'VIEW BOOKING ERROR:',
            error
          );


          alert(

            error?.error?.message ||

            error?.message ||

            'Unable to fetch booking details.'

          );

        }

      });

  }


  // ======================================================
  // APPROVE BOOKING
  // ======================================================

  approveBooking(
    booking: InspectionBooking
  ): void {

    if (
      booking.status === 'Approved'
    ) {

      return;

    }


    const confirmed =
      confirm(
        `Approve booking #${booking.booking_id}?`
      );


    if (!confirmed) {

      return;

    }


    this.updateStatus(
      booking,
      'Approved'
    );

  }


  // ======================================================
  // REJECT BOOKING
  // ======================================================

  rejectBooking(
    booking: InspectionBooking
  ): void {

    if (
      booking.status === 'Rejected'
    ) {

      return;

    }


    const confirmed =
      confirm(
        `Reject booking #${booking.booking_id}?`
      );


    if (!confirmed) {

      return;

    }


    this.updateStatus(
      booking,
      'Rejected'
    );

  }


  // ======================================================
  // UPDATE STATUS
  // ======================================================

  private updateStatus(

    booking: InspectionBooking,

    status:
      'Approved' |
      'Rejected'

  ): void {


    this.bookingService
      .updateBookingStatus(
        booking.booking_id,
        status
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'UPDATE STATUS RESPONSE:',
            response
          );


          if (
            response?.success === false
          ) {

            alert(
              response?.message ||
              'Unable to update booking status.'
            );

            return;

          }


          // ==================================================
          // UPDATE LOCAL DATA
          // ==================================================

          booking.status =
            status;


          const original =
            this.bookings.find(
              item =>
                item.booking_id ===
                booking.booking_id
            );


          if (original) {

            original.status =
              status;

          }


          alert(
            `Booking #${booking.booking_id} ${status.toLowerCase()} successfully.`
          );


          // ==================================================
          // REFRESH LIST
          // ==================================================

          this.searchBookings();

        },


        error: (error) => {

          console.error(
            'UPDATE BOOKING STATUS ERROR:',
            error
          );


          alert(

            error?.error?.message ||

            error?.message ||

            'Unable to update booking status.'

          );

        }

      });

  }


  // ======================================================
  // ASSIGN INSPECTION
  // ======================================================

  assignInspection(
    booking: InspectionBooking
  ): void {

    const employeeId =
      this.selectedEmployeeByBooking[
        booking.booking_id
      ];


    // ====================================================
    // VALIDATE EMPLOYEE
    // ====================================================

    if (
      !employeeId
    ) {

      alert(
        'Please select an employee first.'
      );

      return;

    }


    // ====================================================
    // CONFIRM ASSIGNMENT
    // ====================================================

    const employee =
      this.employees.find(
        item =>
          item.admin_id ===
          Number(employeeId)
      );


    const confirmed =
      confirm(

`Assign inspection booking #${booking.booking_id}

Customer: ${booking.name || '-'}

Vehicle: ${
  booking.brand || '-'
} ${
  booking.model || ''
}

Employee: ${
  employee?.name || '-'
}

Do you want to continue?`

      );


    if (!confirmed) {

      return;

    }


    this.assigningBookingId =
      booking.booking_id;


    // ====================================================
    // API
    // ====================================================

    this.bookingService
      .assignInspection(
        booking.booking_id,
        Number(employeeId)
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'ASSIGN INSPECTION RESPONSE:',
            response
          );


          if (
            response?.success === false
          ) {

            alert(
              response?.message ||
              'Unable to assign inspection.'
            );

            this.assigningBookingId = null;

            return;

          }


          // ==================================================
          // UPDATE LOCAL BOOKING
          // ==================================================

          booking.employee_id =
            employee?.admin_id;


          booking.employee_name =
            employee?.name;


          booking.employee_email =
            employee?.email;


          booking.inspection_request_status =
            response?.data?.status ??
            response?.status ??
            'Assigned';


          booking.inspection_request_id =
            response?.data?.request_id ??
            response?.request_id ??
            booking.inspection_request_id;


          // ==================================================
          // CLEAR SELECTION
          // ==================================================

          delete this.selectedEmployeeByBooking[
            booking.booking_id
          ];


          this.assigningBookingId =
            null;


          alert(
            `Inspection booking #${booking.booking_id} assigned to ${employee?.name || 'employee'} successfully.`
          );


          // ==================================================
          // REFRESH BOOKINGS
          // ==================================================

          this.loadBookings();

        },


        error: (error) => {

          console.error(
            'ASSIGN INSPECTION ERROR:',
            error
          );


          this.assigningBookingId =
            null;


          alert(

            error?.error?.message ||

            error?.message ||

            'Unable to assign inspection.'

          );

        }

      });

  }


  // ======================================================
  // CHECK ASSIGNED
  // ======================================================

  isAssigned(
    booking: InspectionBooking
  ): boolean {

    return !!(
      booking.employee_id ||
      booking.employee_name ||
      booking.inspection_request_id
    );

  }


  // ======================================================
  // TRACK BY BOOKING ID
  // ======================================================

  trackByBookingId(
    index: number,
    booking: InspectionBooking
  ): number {

    return booking.booking_id;

  }


  // ======================================================
  // TRACK BY EMPLOYEE ID
  // ======================================================

  trackByEmployeeId(
    index: number,
    employee: Employee
  ): number {

    return employee.admin_id;

  }

}