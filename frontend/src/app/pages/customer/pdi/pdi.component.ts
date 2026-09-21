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
// PDI RESPONSE
// Same backend response structure as Inspection Booking
// ======================================================

interface PdiResponse {

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

  selector: 'app-pdi',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './pdi.component.html',

  styleUrl: './pdi.component.css'

})


export class PdiComponent {


  // ====================================================
  // HTTP
  // ====================================================

  private http =
    inject(HttpClient);


  // ====================================================
  // API URL
  //
  // SAME API AS BOOK INSPECTION
  // Therefore backend/table flow remains the same.
  // ====================================================

  private apiUrl =
    'https://api.carsey.in/api/vehicles/book-inspection';


  // ====================================================
  // FORM DATA
  //
  // Vehicle Number intentionally removed from PDI.
  // All other field names are kept compatible with
  // the existing Book Inspection payload.
  // ====================================================

  form = {

    name: '',

    mobile: '',

    email: '',

    city: '',

    brand: '',

    model: '',

    address: '',

    bookingDate: '',

    timeSlot: '',
    bookingType: 'PDI'

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
  // SUBMIT PDI
  // ====================================================

  submitPdi(): void {


    // ==================================================
    // CLEAR OLD MESSAGES
    // ==================================================

    this.errorMessage = '';

    this.successMessage = '';

    this.bookingId = null;

    this.submitted = true;


    // ==================================================
    // REQUIRED FIELD VALIDATION
    // Same required customer fields as Book Inspection.
    // ==================================================

    if (

      !this.form.name.trim() ||

      !this.form.mobile.trim() ||

      !this.form.email.trim() ||

      !this.form.city.trim() ||

      !this.form.address.trim()

    ) {

      this.errorMessage =
        'Please fill all required fields.';


      // =================================================
      // FAIL ALERT
      // =================================================

      alert(
        'Unable to submit PDI request.\n\nPlease fill all required fields.'
      );


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


      // =================================================
      // FAIL ALERT
      // =================================================

      alert(
        'Unable to submit PDI request.\n\nName should contain only letters and spaces.'
      );


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


      // =================================================
      // FAIL ALERT
      // =================================================

      alert(
        'Unable to submit PDI request.\n\nMobile number must contain exactly 10 digits.'
      );


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


      // =================================================
      // FAIL ALERT
      // =================================================

      alert(
        'Unable to submit PDI request.\n\nPlease enter a valid email address.'
      );


      return;

    }


    // ==================================================
    // DATE VALIDATION
    // ==================================================

    if (

      this.form.bookingDate &&

      this.form.bookingDate < this.today

    ) {

      this.errorMessage =
        'Please select a valid future date.';


      // =================================================
      // FAIL ALERT
      // =================================================

      alert(
        'Unable to submit PDI request.\n\nPlease select a valid future date.'
      );


      return;

    }


    // ==================================================
    // START SUBMITTING
    // ==================================================

    this.submitting = true;


    // ==================================================
    // SEND DATA TO BACKEND
    //
    // Same endpoint and same compatible fields as
    // Book Inspection.
    //
    // Vehicle Number is NOT sent.
    // ==================================================

    this.http.post<PdiResponse>(

      this.apiUrl,

      this.form

    ).subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (

        response: PdiResponse

      ) => {


        // =================================================
        // STOP LOADING
        // =================================================

        this.submitting = false;


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        if (response.success) {


          // ===============================================
          // SUCCESS ALERT
          // ===============================================

          alert(
            'PDI Submitted Successfully'
          );


          // ===============================================
          // SAVE BOOKING ID
          // ===============================================

          this.bookingId =
            response.data?.bookingId ??
            null;


          // ===============================================
          // RESET FORM
          // ===============================================

          this.form = {

            name: '',

            mobile: '',

            email: '',

            city: '',

            brand: '',

            model: '',

            address: '',

            bookingDate: '',

            timeSlot: '',
    bookingType: 'PDI'

          };


          // ===============================================
          // CLEAR STATES
          // ===============================================

          this.successMessage = '';

          this.errorMessage = '';

          this.submitted = false;


        } else {


          // ===============================================
          // API RETURNED success:false
          // ===============================================

          this.errorMessage =

            response.message ||

            'Unable to submit PDI request.';


          // ===============================================
          // FAIL ALERT
          // ===============================================

          alert(

            'Unable to submit PDI request.\n\n' +

            (

              response.message ||

              'Please try again.'

            )

          );

        }

      },


      // =================================================
      // API ERROR
      // =================================================

      error: (

        error

      ) => {


        // ===============================================
        // CONSOLE ERROR
        // ===============================================

        console.error(

          'PDI Error:',

          error

        );


        // ===============================================
        // STOP LOADING
        // ===============================================

        this.submitting = false;


        // ===============================================
        // GET BACKEND ERROR MESSAGE
        // ===============================================

        const backendMessage =

          error?.error?.message ||

          error?.message ||

          'Unable to submit PDI request. Please try again.';


        this.errorMessage =
          backendMessage;


        // ===============================================
        // FAIL ALERT
        // ===============================================

        alert(

          'Unable to submit PDI request.\n\n' +

          backendMessage

        );

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

      brand: '',

      model: '',

      address: '',

      bookingDate: '',

      timeSlot: '',
    bookingType: 'PDI'

    };


    this.submitted = false;

    this.successMessage = '';

    this.errorMessage = '';

    this.bookingId = null;

    this.submitting = false;

  }

}