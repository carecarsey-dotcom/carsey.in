import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

type ImageType =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'interiorFront'
  | 'interiorRear'
  | 'openDicky'
  | 'openBonnet'
  | 'odometer'
  | 'dashboard';

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
  ownerName = '';
  ownerClassification = '';
  mobile = '';
  email = '';
  city = '';

  brand = '';
  model = '';
  variant = '';
  vehicleNumber = '';

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

  interiorFrontImage: File | null = null;
  interiorRearImage: File | null = null;
  openDickyImage: File | null = null;
  openBonnetImage: File | null = null;
  odometerImage: File | null = null;
  dashboardImage: File | null = null;


  // =====================================================
  // IMAGE PREVIEWS
  // =====================================================

  frontPreview = '';
  backPreview = '';
  leftPreview = '';
  rightPreview = '';

  interiorFrontPreview = '';
  interiorRearPreview = '';
  openDickyPreview = '';
  openBonnetPreview = '';
  odometerPreview = '';
  dashboardPreview = '';


  // =====================================================
  // FORM STATE
  // =====================================================

  submitting = false;


  // =====================================================
  // NAME INPUT
  // =====================================================

  onNameInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.sellerName = input.value.replace(/[^a-zA-Z ]/g, '');

  }


  // =====================================================
  // MOBILE INPUT
  // =====================================================

  onMobileInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.mobile = input.value
      .replace(/\D/g, '')
      .slice(0, 10);

  }


  // =====================================================
  // VEHICLE NUMBER INPUT
  // =====================================================

  onVehicleNumberInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.vehicleNumber = input.value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 20);

  }


  // =====================================================
  // IMAGE SELECT
  // =====================================================

  onFileSelected(
    event: Event,
    type: ImageType
  ): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // IMAGE TYPE CHECK

    if (!file.type.startsWith('image/')) {

      alert('Please select a valid image file.');

      input.value = '';

      return;
    }


    // IMAGE SIZE CHECK - MAX 5 MB

    if (file.size > 5 * 1024 * 1024) {

      alert('Image size must be less than 5 MB.');

      input.value = '';

      return;
    }


    // CREATE PREVIEW

    const reader = new FileReader();

    reader.onload = () => {

      const preview = reader.result as string;

      switch (type) {

        case 'front':
          this.frontImage = file;
          this.frontPreview = preview;
          break;

        case 'back':
          this.backImage = file;
          this.backPreview = preview;
          break;

        case 'left':
          this.leftImage = file;
          this.leftPreview = preview;
          break;

        case 'right':
          this.rightImage = file;
          this.rightPreview = preview;
          break;

        case 'interiorFront':
          this.interiorFrontImage = file;
          this.interiorFrontPreview = preview;
          break;

        case 'interiorRear':
          this.interiorRearImage = file;
          this.interiorRearPreview = preview;
          break;

        case 'openDicky':
          this.openDickyImage = file;
          this.openDickyPreview = preview;
          break;

        case 'openBonnet':
          this.openBonnetImage = file;
          this.openBonnetPreview = preview;
          break;

        case 'odometer':
          this.odometerImage = file;
          this.odometerPreview = preview;
          break;

        case 'dashboard':
          this.dashboardImage = file;
          this.dashboardPreview = preview;
          break;

      }

    };

    reader.readAsDataURL(file);

  }


  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  removeImage(type: ImageType): void {

    switch (type) {

      case 'front':
        this.frontImage = null;
        this.frontPreview = '';
        break;

      case 'back':
        this.backImage = null;
        this.backPreview = '';
        break;

      case 'left':
        this.leftImage = null;
        this.leftPreview = '';
        break;

      case 'right':
        this.rightImage = null;
        this.rightPreview = '';
        break;

      case 'interiorFront':
        this.interiorFrontImage = null;
        this.interiorFrontPreview = '';
        break;

      case 'interiorRear':
        this.interiorRearImage = null;
        this.interiorRearPreview = '';
        break;

      case 'openDicky':
        this.openDickyImage = null;
        this.openDickyPreview = '';
        break;

      case 'openBonnet':
        this.openBonnetImage = null;
        this.openBonnetPreview = '';
        break;

      case 'odometer':
        this.odometerImage = null;
        this.odometerPreview = '';
        break;

      case 'dashboard':
        this.dashboardImage = null;
        this.dashboardPreview = '';
        break;

    }

  }


  // =====================================================
  // SUBMIT FORM
  // =====================================================

  submitForm(): void {

    // NAME

    if (!this.sellerName.trim()) {
      alert('Name is required.');
      return;
    }

    if (!/^[a-zA-Z ]+$/.test(this.sellerName.trim())) {
      alert('Name can contain only letters and spaces.');
      return;
    }

    if (this.sellerName.trim().length < 2) {
      alert('Name must contain at least 2 characters.');
      return;
    }


    // OWNER CLASSIFICATION

    if (!['First Owner', 'Second Owner', 'Third Owner'].includes(this.ownerClassification)) {
      alert('Please select owner classification.');
      return;
    }


    // MOBILE

    if (!/^[0-9]{10}$/.test(this.mobile)) {
      alert('Mobile number must contain exactly 10 digits.');
      return;
    }


    // CITY

    if (!this.city.trim()) {
      alert('City is required.');
      return;
    }


    // BRAND

    if (!this.brand.trim()) {
      alert('Brand is required.');
      return;
    }


    // MODEL

    if (!this.model.trim()) {
      alert('Model is required.');
      return;
    }


    // VEHICLE NUMBER

    if (!this.vehicleNumber.trim()) {
      alert('Vehicle number is required.');
      return;
    }

    const normalizedVehicleNumber = this.vehicleNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '');

    if (!/^[A-Z0-9-]{4,20}$/.test(normalizedVehicleNumber)) {
      alert('Please enter a valid vehicle number.');
      return;
    }


    // MANUFACTURING YEAR

    if (!this.manufacturingYear) {
      alert('Manufacturing year is required.');
      return;
    }


    // FUEL

    if (!this.fuelType) {
      alert('Please select fuel type.');
      return;
    }


    // TRANSMISSION

    if (!this.transmission) {
      alert('Please select transmission.');
      return;
    }


    // ===================================================
    // REQUIRED IMAGES
    // ONLY 4 IMAGES ARE MANDATORY
    // ===================================================

    const requiredImages = [
      ['Front Image', this.frontImage],
      ['Back Image', this.backImage],
      ['Left Side Image', this.leftImage],
      ['Right Side Image', this.rightImage]
    ] as const;

    const missingImage = requiredImages.find(
      ([, image]) => !image
    );

    if (missingImage) {
      alert(`${missingImage[0]} is required.`);
      return;
    }


    // ===================================================
    // FORM DATA
    // ===================================================

    const formData = new FormData();

    formData.append('sellerName', this.sellerName.trim());

    formData.append('ownerName', '');

    formData.append('ownerClassification', this.ownerClassification);

    formData.append('mobile', this.mobile);

    formData.append('email', this.email.trim());

    formData.append('city', this.city.trim());

    formData.append('brand', this.brand.trim());

    formData.append('model', this.model.trim());

    formData.append('variant', this.variant.trim());

    formData.append('vehicleNumber', normalizedVehicleNumber);

    formData.append('manufacturingYear', String(this.manufacturingYear));

    formData.append('fuelType', this.fuelType);

    formData.append('transmission', this.transmission);

    formData.append('kmDriven', String(this.kmDriven ?? ''));

    formData.append('expectedPrice', String(this.expectedPrice ?? ''));


    // ===================================================
    // IMAGE UPLOAD
    // ===================================================

    if (this.frontImage) {
      formData.append('frontImage', this.frontImage, this.frontImage.name);
    }

    if (this.backImage) {
      formData.append('backImage', this.backImage, this.backImage.name);
    }

    if (this.leftImage) {
      formData.append('leftImage', this.leftImage, this.leftImage.name);
    }

    if (this.rightImage) {
      formData.append('rightImage', this.rightImage, this.rightImage.name);
    }


    // OPTIONAL IMAGES

    if (this.interiorFrontImage) {
      formData.append(
        'interiorFrontImage',
        this.interiorFrontImage,
        this.interiorFrontImage.name
      );
    }

    if (this.interiorRearImage) {
      formData.append(
        'interiorRearImage',
        this.interiorRearImage,
        this.interiorRearImage.name
      );
    }

    if (this.openDickyImage) {
      formData.append(
        'openDickyImage',
        this.openDickyImage,
        this.openDickyImage.name
      );
    }

    if (this.openBonnetImage) {
      formData.append(
        'openBonnetImage',
        this.openBonnetImage,
        this.openBonnetImage.name
      );
    }

    if (this.odometerImage) {
      formData.append(
        'odometerImage',
        this.odometerImage,
        this.odometerImage.name
      );
    }

    if (this.dashboardImage) {
      formData.append(
        'dashboardImage',
        this.dashboardImage,
        this.dashboardImage.name
      );
    }


    // ===================================================
    // SUBMIT
    // ===================================================

    this.submitting = true;

    this.http.post<any>(
      'https://api.carsey.in/api/vehicles/sell-car',
      formData
    ).subscribe({

      // SUCCESS

      next: (response) => {

        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', {
            content_name: 'Sell Car Request',
            content_category: 'Sell Car'
          });
        }

        console.log('Sell Car Response:', response);

        this.submitting = false;

        alert('Sell Car Request Submitted Successfully');

        this.resetForm();

      },


      // ERROR

      error: (error) => {

        console.error('Sell Car Error:', error);

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
    this.ownerName = '';
    this.ownerClassification = '';
    this.mobile = '';
    this.email = '';
    this.city = '';

    this.brand = '';
    this.model = '';
    this.variant = '';
    this.vehicleNumber = '';

    this.manufacturingYear = null;

    this.fuelType = '';
    this.transmission = '';

    this.kmDriven = null;
    this.expectedPrice = null;


    // RESET IMAGES

    this.frontImage = null;
    this.backImage = null;
    this.leftImage = null;
    this.rightImage = null;

    this.interiorFrontImage = null;
    this.interiorRearImage = null;
    this.openDickyImage = null;
    this.openBonnetImage = null;
    this.odometerImage = null;
    this.dashboardImage = null;


    // RESET PREVIEWS

    this.frontPreview = '';
    this.backPreview = '';
    this.leftPreview = '';
    this.rightPreview = '';

    this.interiorFrontPreview = '';
    this.interiorRearPreview = '';
    this.openDickyPreview = '';
    this.openBonnetPreview = '';
    this.odometerPreview = '';
    this.dashboardPreview = '';

  }

}