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

}


@Component({

  selector:
    'app-inspection-bookings',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    

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

    this.loadBookings();

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
        ''

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
  // TRACK BY
  // ======================================================

  trackByBookingId(
    index: number,
    booking: InspectionBooking
  ): number {

    return booking.booking_id;

  }

}