import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';


// ======================================================
// INSPECTION BOOKING RESPONSE
// ======================================================

interface InspectionBookingResponse {

  success: boolean;

  message: string;

  data?: {

    bookingId?: number;

    message?: string;

  };

}


// ======================================================
// COMPONENT
// ======================================================

@Component({

  selector: 'app-book-inspection',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './book-inspection.component.html',

  styleUrl: './book-inspection.component.css'

})


export class BookInspectionComponent {


  // ====================================================
  // HTTP
  // ====================================================

  private http =
    inject(HttpClient);


  // ====================================================
  // API URL
  // ====================================================

  private apiUrl =
    'http://localhost:5000/api/vehicles/book-inspection';


  // ====================================================
  // FORM DATA
  // ====================================================

  form = {

    name: '',

    mobile: '',

    email: '',

    city: '',

    vehicleNumber: '',

    brand: '',

    model: '',

    address: '',

    bookingDate: '',

    timeSlot: ''

  };


  // ====================================================
  // FORM STATE
  // ====================================================

  submitting = false;

  submitted = false;

  errorMessage = '';

  successMessage = '';

  bookingId: number | null = null;


  // ====================================================
  // TODAY DATE
  // ====================================================

  get today(): string {

    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );

    return `${year}-${month}-${day}`;

  }


  // ====================================================
  // NAME VALIDATION
  // ONLY LETTERS + SPACE
  // ====================================================

  onNameInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.form.name =
      input.value
        .replace(
          /[^a-zA-Z\s]/g,
          ''
        );

  }


  // ====================================================
  // MOBILE VALIDATION
  // ONLY NUMBERS
  // MAX 10 DIGITS
  // ====================================================

  onMobileInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.form.mobile =
      input.value
        .replace(
          /[^0-9]/g,
          ''
        )
        .slice(
          0,
          10
        );

  }


  // ====================================================
  // VEHICLE NUMBER VALIDATION
  // ALPHANUMERIC
  // ====================================================

  onVehicleNumberInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    this.form.vehicleNumber =
      input.value
        .replace(
          /[^a-zA-Z0-9\s-]/g,
          ''
        )
        .toUpperCase();

  }


  // ====================================================
  // SUBMIT BOOKING
  // ====================================================

  submitBooking(): void {

    // ==================================================
    // CLEAR OLD MESSAGES
    // ==================================================

    this.errorMessage = '';

    this.successMessage = '';

    this.bookingId = null;

    this.submitted = true;


    // ==================================================
    // REQUIRED FIELD VALIDATION
    // ==================================================

    if (

      !this.form.name.trim() ||

      !this.form.mobile.trim() ||

      !this.form.email.trim() ||

      !this.form.city.trim() ||

      !this.form.vehicleNumber.trim() ||

      !this.form.brand.trim() ||

      !this.form.model.trim() ||

      !this.form.address.trim() ||

      !this.form.bookingDate ||

      !this.form.timeSlot

    ) {

      this.errorMessage =
        'Please fill all required fields.';

      return;

    }


    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (
      !/^[a-zA-Z\s]+$/.test(
        this.form.name.trim()
      )
    ) {

      this.errorMessage =
        'Name should contain only letters and spaces.';

      return;

    }


    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (
      !/^[0-9]{10}$/.test(
        this.form.mobile
      )
    ) {

      this.errorMessage =
        'Mobile number must contain exactly 10 digits.';

      return;

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.form.email.trim()
      )
    ) {

      this.errorMessage =
        'Please enter a valid email address.';

      return;

    }


    // ==================================================
    // DATE VALIDATION
    // ==================================================

    if (
      this.form.bookingDate < this.today
    ) {

      this.errorMessage =
        'Please select a valid future date.';

      return;

    }


    // ==================================================
    // START SUBMITTING
    // ==================================================

    this.submitting = true;


    // ==================================================
    // SEND DATA TO BACKEND
    // ==================================================

    this.http.post<InspectionBookingResponse>(

      this.apiUrl,

      this.form

    ).subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (
        response: InspectionBookingResponse
      ) => {

        this.submitting = false;


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        if (response.success) {

          // -----------------------------------------------
          // ONLY SUCCESS ALERT
          // BOOKING ID WILL NOT BE SHOWN
          // -----------------------------------------------

          alert(
            'Booking Submitted Successfully'
          );


          // -----------------------------------------------
          // RESET FORM
          // -----------------------------------------------

          this.form = {

            name: '',

            mobile: '',

            email: '',

            city: '',

            vehicleNumber: '',

            brand: '',

            model: '',

            address: '',

            bookingDate: '',

            timeSlot: ''

          };


          // -----------------------------------------------
          // CLEAR STATES
          // -----------------------------------------------

          this.successMessage = '';

          this.errorMessage = '';

          this.submitted = false;

          this.bookingId = null;


        } else {

          // -----------------------------------------------
          // API SUCCESS FALSE
          // -----------------------------------------------

          this.errorMessage =
            response.message ||
            'Unable to submit inspection booking.';

        }

      },


      // =================================================
      // API ERROR
      // =================================================

      error: (
        error
      ) => {

        console.error(
          'Inspection Booking Error:',
          error
        );


        this.submitting = false;


        this.errorMessage =
          error?.error?.message ||
          'Unable to submit inspection booking. Please try again.';

      }

    });

  }


  // ====================================================
  // RESET FORM
  // ====================================================

  resetForm(): void {

    this.form = {

      name: '',

      mobile: '',

      email: '',

      city: '',

      vehicleNumber: '',

      brand: '',

      model: '',

      address: '',

      bookingDate: '',

      timeSlot: ''

    };


    this.submitted = false;

    this.successMessage = '';

    this.errorMessage = '';

    this.bookingId = null;

  }

}