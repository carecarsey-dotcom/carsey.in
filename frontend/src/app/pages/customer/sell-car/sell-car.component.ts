import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sell-car',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './sell-car.component.html',
  styleUrl: './sell-car.component.css'
})
export class SellCarComponent {

  private http = inject(HttpClient);

  // =====================================================
  // FORM DATA
  // =====================================================

  sellerName = '';
  mobile = '';
  email = '';

  brand = '';
  model = '';
  variant = '';

  manufacturingYear: number | null = null;

  fuelType = '';
  transmission = '';

  kmDriven: number | null = null;
  expectedPrice: number | null = null;


  // =====================================================
  // IMAGES
  // =====================================================

  frontImage: File | null = null;
  backImage: File | null = null;
  leftImage: File | null = null;
  rightImage: File | null = null;


  // =====================================================
  // IMAGE PREVIEWS
  // =====================================================

  frontPreview = '';
  backPreview = '';
  leftPreview = '';
  rightPreview = '';


  // =====================================================
  // FORM STATE
  // =====================================================

  submitting = false;


  // =====================================================
  // NAME INPUT
  // =====================================================

  onNameInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.sellerName =
      input.value
        .replace(/[^a-zA-Z ]/g, '');

  }


  // =====================================================
  // MOBILE INPUT
  // =====================================================

  onMobileInput(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.mobile =
      input.value
        .replace(/\D/g, '')
        .slice(0, 10);

  }


  // =====================================================
  // IMAGE SELECT
  // =====================================================

  onFileSelected(
    event: Event,
    type: 'front' | 'back' | 'left' | 'right'
  ): void {

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


    // =================================================
    // IMAGE TYPE CHECK
    // =================================================

    if (!file.type.startsWith('image/')) {

      alert('Please select a valid image file.');

      input.value = '';

      return;

    }


    // =================================================
    // IMAGE SIZE CHECK
    // MAX 5 MB
    // =================================================

    if (file.size > 5 * 1024 * 1024) {

      alert('Image size must be less than 5 MB.');

      input.value = '';

      return;

    }


    // =================================================
    // CREATE PREVIEW
    // =================================================

    const reader =
      new FileReader();

    reader.onload = () => {

      const preview =
        reader.result as string;


      if (type === 'front') {

        this.frontImage = file;
        this.frontPreview = preview;

      }


      if (type === 'back') {

        this.backImage = file;
        this.backPreview = preview;

      }


      if (type === 'left') {

        this.leftImage = file;
        this.leftPreview = preview;

      }


      if (type === 'right') {

        this.rightImage = file;
        this.rightPreview = preview;

      }

    };


    reader.readAsDataURL(file);

  }


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  removeImage(
    type: 'front' | 'back' | 'left' | 'right'
  ): void {

    if (type === 'front') {

      this.frontImage = null;
      this.frontPreview = '';

    }


    if (type === 'back') {

      this.backImage = null;
      this.backPreview = '';

    }


    if (type === 'left') {

      this.leftImage = null;
      this.leftPreview = '';

    }


    if (type === 'right') {

      this.rightImage = null;
      this.rightPreview = '';

    }

  }


  // =====================================================
  // SUBMIT FORM
  // =====================================================

  submitForm(): void {


    // ===================================================
    // NAME
    // ===================================================

    if (!this.sellerName.trim()) {

      alert('Name is required.');

      return;

    }


    if (
      !/^[a-zA-Z ]+$/.test(
        this.sellerName.trim()
      )
    ) {

      alert(
        'Name can contain only letters and spaces.'
      );

      return;

    }


    if (
      this.sellerName.trim().length < 2
    ) {

      alert(
        'Name must contain at least 2 characters.'
      );

      return;

    }


    // ===================================================
    // MOBILE
    // ===================================================

    if (
      !/^[0-9]{10}$/.test(
        this.mobile
      )
    ) {

      alert(
        'Mobile number must contain exactly 10 digits.'
      );

      return;

    }


    // ===================================================
    // EMAIL
    // ===================================================

    if (
      this.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        this.email.trim()
      )
    ) {

      alert(
        'Please enter a valid email address.'
      );

      return;

    }


    // ===================================================
    // BRAND
    // ===================================================

    if (!this.brand.trim()) {

      alert('Brand is required.');

      return;

    }


    // ===================================================
    // MODEL
    // ===================================================

    if (!this.model.trim()) {

      alert('Model is required.');

      return;

    }


    // ===================================================
    // MANUFACTURING YEAR
    // ===================================================

    if (!this.manufacturingYear) {

      alert(
        'Manufacturing year is required.'
      );

      return;

    }


    // ===================================================
    // FUEL
    // ===================================================

    if (!this.fuelType) {

      alert('Please select fuel type.');

      return;

    }


    // ===================================================
    // TRANSMISSION
    // ===================================================

    if (!this.transmission) {

      alert(
        'Please select transmission.'
      );

      return;

    }


    // ===================================================
    // FORM DATA
    // ===================================================

    const formData =
      new FormData();


    formData.append(
      'sellerName',
      this.sellerName.trim()
    );


    formData.append(
      'mobile',
      this.mobile
    );


    formData.append(
      'email',
      this.email.trim()
    );


    formData.append(
      'brand',
      this.brand.trim()
    );


    formData.append(
      'model',
      this.model.trim()
    );


    formData.append(
      'variant',
      this.variant.trim()
    );


    formData.append(
      'manufacturingYear',
      String(this.manufacturingYear)
    );


    formData.append(
      'fuelType',
      this.fuelType
    );


    formData.append(
      'transmission',
      this.transmission
    );


    formData.append(
      'kmDriven',
      String(this.kmDriven ?? '')
    );


    formData.append(
      'expectedPrice',
      String(this.expectedPrice ?? '')
    );


    // ===================================================
    // IMAGES
    // ===================================================

    if (this.frontImage) {

      formData.append(
        'frontImage',
        this.frontImage,
        this.frontImage.name
      );

    }


    if (this.backImage) {

      formData.append(
        'backImage',
        this.backImage,
        this.backImage.name
      );

    }


    if (this.leftImage) {

      formData.append(
        'leftImage',
        this.leftImage,
        this.leftImage.name
      );

    }


    if (this.rightImage) {

      formData.append(
        'rightImage',
        this.rightImage,
        this.rightImage.name
      );

    }


    // ===================================================
    // SUBMIT
    // ===================================================

    this.submitting = true;


    this.http.post<any>(
      'http://localhost:5000/api/vehicles/sell-car',
      formData
    )
    .subscribe({

      // =================================================
      // SUCCESS
      // =================================================

      next: (response) => {

        console.log(
          'Sell Car Response:',
          response
        );


        this.submitting = false;


        // =================================================
        // ALERT
        // =================================================

        alert(
          'Sell Car Request Submitted Successfully'
        );


        // =================================================
        // RESET
        // =================================================

        this.resetForm();

      },


      // =================================================
      // ERROR
      // =================================================

      error: (error) => {

        console.error(
          'Sell Car Error:',
          error
        );


        this.submitting = false;


        alert(
          error?.error?.message ||
          'Unable to submit sell car request. Please try again.'
        );

      }

    });

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  resetForm(): void {

    this.sellerName = '';
    this.mobile = '';
    this.email = '';

    this.brand = '';
    this.model = '';
    this.variant = '';

    this.manufacturingYear = null;

    this.fuelType = '';
    this.transmission = '';

    this.kmDriven = null;
    this.expectedPrice = null;


    // ===================================================
    // RESET IMAGES
    // ===================================================

    this.frontImage = null;
    this.backImage = null;
    this.leftImage = null;
    this.rightImage = null;

    this.frontPreview = '';
    this.backPreview = '';
    this.leftPreview = '';
    this.rightPreview = '';

  }

}