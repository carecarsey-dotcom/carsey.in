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
// RESPONSE INTERFACE
// ======================================================

interface ExchangeResponse {

  success: boolean;

  message: string;

  data?: any;

}


// ======================================================
// COMPONENT
// ======================================================

@Component({

  selector: 'app-exchange',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './exchange.component.html',

  styleUrl: './exchange.component.css'

})


export class ExchangeComponent {


  // ====================================================
  // HTTP
  // ====================================================

  private http = inject(HttpClient);


  // ====================================================
  // API URL
  // ====================================================

  private apiUrl =
    'http://localhost:5000/api/vehicles/exchange';


  // ====================================================
  // FORM
  // ====================================================

  form = {

    name: '',

    mobile: '',

    email: '',

    currentBrand: '',

    currentModel: '',

    currentYear: '',

    currentVehiclePrice: '',

    preferredBrand: '',

    preferredModel: '',

    preferredVariant: '',

    budget: ''

  };


  // ====================================================
  // IMAGE
  // ====================================================

  selectedImage: File | null = null;

  imagePreview: string | null = null;


  // ====================================================
  // SUBMIT STATE
  // ====================================================

  submitting = false;


  // ====================================================
  // NAME INPUT
  // ONLY LETTERS + SPACE
  // ====================================================

  onNameInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.form.name =
      input.value
        .replace(/[^a-zA-Z\s]/g, '');

  }


  // ====================================================
  // MOBILE INPUT
  // ONLY NUMBERS
  // MAX 10 DIGITS
  // ====================================================

  onMobileInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.form.mobile =
      input.value
        .replace(/[^0-9]/g, '')
        .slice(0, 10);

  }


  // ====================================================
  // CURRENT YEAR
  // ONLY NUMBERS
  // ====================================================

  onYearInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.form.currentYear =
      input.value
        .replace(/[^0-9]/g, '')
        .slice(0, 4);

  }


  // ====================================================
  // CURRENT VEHICLE PRICE
  // ONLY NUMBERS
  // ====================================================

  onCurrentPriceInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.form.currentVehiclePrice =
      input.value
        .replace(/[^0-9]/g, '');

  }


  // ====================================================
  // BUDGET
  // ONLY NUMBERS
  // ====================================================

  onBudgetInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.form.budget =
      input.value
        .replace(/[^0-9]/g, '');

  }


  // ====================================================
  // IMAGE SELECT
  // ====================================================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    // ==================================================
    // FILE TYPE
    // ==================================================

    const allowedTypes = [

      'image/jpeg',

      'image/jpg',

      'image/png'

    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        'Only JPG, JPEG and PNG images are allowed.'
      );

      input.value = '';

      return;

    }


    // ==================================================
    // MAX 5 MB
    // ==================================================

    if (
      file.size > 5 * 1024 * 1024
    ) {

      alert(
        'Image size must be less than 5 MB.'
      );

      input.value = '';

      return;

    }


    // ==================================================
    // SAVE FILE
    // ==================================================

    this.selectedImage = file;


    // ==================================================
    // PREVIEW
    // ==================================================

    const reader =
      new FileReader();


    reader.onload = () => {

      this.imagePreview =
        reader.result as string;

    };


    reader.readAsDataURL(file);

  }


  // ====================================================
  // REMOVE IMAGE
  // ====================================================

  removeImage(): void {

    this.selectedImage = null;

    this.imagePreview = null;

  }


  // ====================================================
  // SUBMIT
  // ====================================================

  submitExchange(): void {


    // ==================================================
    // TRIM VALUES
    // ==================================================

    this.form.name =
      this.form.name.trim();

    this.form.mobile =
      this.form.mobile.trim();

    this.form.email =
      this.form.email.trim();

    this.form.currentBrand =
      this.form.currentBrand.trim();

    this.form.currentModel =
      this.form.currentModel.trim();

    this.form.currentYear =
      this.form.currentYear.trim();

    this.form.currentVehiclePrice =
      this.form.currentVehiclePrice.trim();

    this.form.preferredBrand =
      this.form.preferredBrand.trim();

    this.form.preferredModel =
      this.form.preferredModel.trim();

    this.form.preferredVariant =
      this.form.preferredVariant.trim();

    this.form.budget =
      this.form.budget.trim();


    // ==================================================
    // REQUIRED VALIDATION
    // ==================================================

    if (

      !this.form.name ||

      !this.form.mobile ||

      !this.form.email ||

      !this.form.currentBrand ||

      !this.form.currentModel ||

      !this.form.currentYear ||

      !this.form.currentVehiclePrice ||

      !this.form.preferredBrand ||

      !this.form.preferredModel ||

      !this.form.preferredVariant ||

      !this.form.budget

    ) {

      alert(
        'Please fill all required fields.'
      );

      return;

    }


    // ==================================================
    // NAME VALIDATION
    // ==================================================

    if (
      !/^[a-zA-Z\s]+$/.test(
        this.form.name
      )
    ) {

      alert(
        'Name should contain only letters and spaces.'
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

      alert(
        'Mobile number must contain exactly 10 digits.'
      );

      return;

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.form.email
      )
    ) {

      alert(
        'Please enter a valid email address.'
      );

      return;

    }


    // ==================================================
    // YEAR VALIDATION
    // ==================================================

    if (
      !/^[0-9]{4}$/.test(
        this.form.currentYear
      )
    ) {

      alert(
        'Please enter a valid manufacturing year.'
      );

      return;

    }


    // ==================================================
    // START SUBMIT
    // ==================================================

    this.submitting = true;


    // ==================================================
    // FORM DATA
    // IMPORTANT:
    // Backend expects these EXACT names
    // ==================================================

    const formData =
      new FormData();


    formData.append(
      'name',
      this.form.name
    );


    formData.append(
      'mobile',
      this.form.mobile
    );


    formData.append(
      'email',
      this.form.email
    );


    formData.append(
      'currentBrand',
      this.form.currentBrand
    );


    formData.append(
      'currentModel',
      this.form.currentModel
    );


    formData.append(
      'currentYear',
      this.form.currentYear
    );


    formData.append(
      'currentVehiclePrice',
      this.form.currentVehiclePrice
    );


    formData.append(
      'preferredBrand',
      this.form.preferredBrand
    );


    formData.append(
      'preferredModel',
      this.form.preferredModel
    );


    formData.append(
      'preferredVariant',
      this.form.preferredVariant
    );


    formData.append(
      'budget',
      this.form.budget
    );


    // ==================================================
    // IMAGE
    // ==================================================

    if (this.selectedImage) {

      formData.append(
        'vehicleImage',
        this.selectedImage
      );

    }


    // ==================================================
    // API REQUEST
    // ==================================================

    this.http.post<ExchangeResponse>(

      this.apiUrl,

      formData

    ).subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (response) => {

        this.submitting = false;


        console.log(
          'Exchange API Response:',
          response
        );


        if (response.success) {


          // ============================================
          // SUCCESS ALERT
          // ============================================

          alert(
            'Exchange Request Submitted Successfully'
          );


          // ============================================
          // RESET FORM
          // ============================================

          this.resetForm();

        }

        else {

          alert(
            response.message ||
            'Unable to submit exchange request.'
          );

        }

      },


      // =================================================
      // ERROR
      // =================================================

      error: (error) => {

        this.submitting = false;


        console.error(
          'Exchange Request Error:',
          error
        );


        alert(

          error?.error?.message ||

          'Unable to submit exchange request. Please try again.'

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

      currentBrand: '',

      currentModel: '',

      currentYear: '',

      currentVehiclePrice: '',

      preferredBrand: '',

      preferredModel: '',

      preferredVariant: '',

      budget: ''

    };


    this.selectedImage = null;

    this.imagePreview = null;

  }

}