import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  HttpClient
} from '@angular/common/http';

import {
  FormsModule
} from '@angular/forms';


// =====================================================
// VEHICLE IMAGE
// =====================================================

interface VehicleImage {

  image_id?: number;

  car_id?: number;

  image_type?: string;

  image_path?: string;

  // Backend/public API compatibility fields
  image_url?: string;

  imageUrl?: string;

  url?: string;

  path?: string;

  src?: string;

  filename?: string;

  file_name?: string;

  is_primary?: number | boolean;

}


// =====================================================
// VEHICLE
// =====================================================

interface Vehicle {

  car_id: number;

  brand: string;

  model: string;

  variant?: string;

  manufacturing_year?: number;

  price?: number;

  odometer?: number;

  fuel_type?: string;

  transmission?: string;

  city?: string;

  location?: string;

  status?: string;

  listing_status?: string;

  published_at?: string;

  owner_classification?: string;

  owner_type?: string;

  ownership?: string;

  overall_score?: number;

  inspection_score?: number;

  score?: number;

  vin?: string;

  body_style?: string;

  drive_type?: string;

  engine?: string;

  exterior_color?: string;

  interior_color?: string;

  seats?: number;

  images?: VehicleImage[];

  car_images?: VehicleImage[];

  vehicle_images?: VehicleImage[];

}


// =====================================================
// API RESPONSE
// =====================================================

interface VehicleResponse {

  success?: boolean;

  message?: string;

  data?: {

    vehicle?: Vehicle;

    vehicles?: Vehicle[];

    images?: VehicleImage[];

    car_images?: VehicleImage[];

    vehicle_images?: VehicleImage[];

  };

  vehicle?: Vehicle;

  vehicles?: Vehicle[];

  images?: VehicleImage[];

  car_images?: VehicleImage[];

  vehicle_images?: VehicleImage[];

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-car-details',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    RouterLink

  ],

  templateUrl: './car-details.component.html'

})


export class CarDetailsComponent
  implements OnInit, OnDestroy {


  // ===================================================
  // HTTP
  // ===================================================

  private http =
    inject(HttpClient);


  // ===================================================
  // ROUTE
  // ===================================================

  private route =
    inject(ActivatedRoute);


  // ===================================================
  // API
  // ===================================================

  private apiUrl =
  'https://dependable-determination-production-434d.up.railway.app/api';


  // ===================================================
  // VEHICLE
  // ===================================================

  vehicle =
    signal<Vehicle | null>(null);


  // ===================================================
  // LOADING
  // ===================================================

  loading =
    signal(true);


  // ===================================================
  // ERROR
  // ===================================================

  error =
    signal('');


  // ===================================================
  // ACTIVE TAB
  // ===================================================

  activeTab =
    signal<'price' | 'finance'>('price');


  // ===================================================
  // ACTIVE IMAGE
  // ===================================================

  activeImageIndex =
    signal(0);

  // ===================================================
  // IMAGE AUTO SLIDER
  // ===================================================

  private imageAutoSlideInterval:
    ReturnType<typeof setInterval> | null = null;


  // ===================================================
  // FORM STATES
  // ===================================================

  showFinanceForm =
    signal(false);

  showTestDriveForm =
    signal(false);

  showInspectionForm =
    signal(false);


  // ===================================================
  // FORM SUBMISSION STATE
  // ===================================================

  submitting =
    signal(false);

  submitError =
    signal('');

  submitSuccess =
    signal('');


  // ===================================================
  // FINANCE FORM
  // ===================================================

  financeForm = {
    name: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    occupation: '',
    downPayment: ''
  };


  // ===================================================
  // TEST DRIVE FORM
  // ===================================================

  testDriveForm = {
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    city: ''
  };


  // ===================================================
  // INSPECTION FORM
  // ===================================================

  inspectionForm = {

    name: '',

    phone: '',

    email: ''

  };


  // ===================================================
  // INIT
  // ===================================================

  ngOnInit(): void {

    const carId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );


    if (!carId) {

      this.error.set(
        'Invalid car ID.'
      );

      this.loading.set(false);

      return;

    }


    this.loadVehicle(carId);

  }


  // ===================================================
  // LOAD VEHICLE
  // ===================================================

  loadVehicle(
    carId: number
  ): void {

    this.loading.set(true);

    this.error.set('');


    this.http
      .get<VehicleResponse>(
        `${this.apiUrl}/vehicles/${carId}`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Vehicle Details API:',
            response
          );


          const selectedVehicle =
            this.extractVehicle(
              response,
              carId
            );


          if (selectedVehicle) {

            this.vehicle.set(
              selectedVehicle
            );

            this.activeImageIndex.set(0);

            // Load the public image collection separately.
            // The vehicle detail API may return vehicle data without images.
            this.loadVehicleImages(carId);

            this.startImageAutoSlide();

            this.loading.set(false);

          }

          else {

            this.loadFromPublishedVehicles(
              carId
            );

          }

        },


        error: (apiError) => {

          console.warn(
            'Vehicle details endpoint failed. Trying published vehicles...',
            apiError
          );


          this.loadFromPublishedVehicles(
            carId
          );

        }

      });

  }


  // ===================================================
  // FALLBACK
  // ===================================================

  private loadFromPublishedVehicles(
    carId: number
  ): void {

    this.http
      .get<VehicleResponse>(
        `${this.apiUrl}/vehicles/published`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Published Vehicles:',
            response
          );


          let vehicles: Vehicle[] = [];


          if (
            response?.data?.vehicles
          ) {

            vehicles =
              response.data.vehicles;

          }

          else if (
            response?.vehicles
          ) {

            vehicles =
              response.vehicles;

          }


          const selectedVehicle =
            vehicles.find(
              car =>
                Number(car.car_id) ===
                Number(carId)
            );


          if (selectedVehicle) {

            this.vehicle.set(
              selectedVehicle
            );

            this.activeImageIndex.set(0);

            // Published vehicle data can also omit images.
            this.loadVehicleImages(carId);

            this.error.set('');

            this.loading.set(false);

          }

          else {

            this.error.set(
              'Car details not found.'
            );

            this.loading.set(false);

          }

        },


        error: (apiError) => {

          console.error(
            'Published vehicle API error:',
            apiError
          );


          this.error.set(
            'Unable to load car details. Please check the backend API.'
          );


          this.loading.set(false);

        }

      });

  }


  // ===================================================
  // EXTRACT VEHICLE
  // ===================================================

  private extractVehicle(
    response: VehicleResponse,
    carId: number
  ): Vehicle | null {


    if (
      response?.data?.vehicle
    ) {

      return response.data.vehicle;

    }


    if (
      response?.vehicle
    ) {

      return response.vehicle;

    }


    if (
      response?.data?.vehicles?.length
    ) {

      return (

        response.data.vehicles.find(
          car =>
            Number(car.car_id) ===
            Number(carId)
        ) || null

      );

    }


    if (
      response?.vehicles?.length
    ) {

      return (

        response.vehicles.find(
          car =>
            Number(car.car_id) ===
            Number(carId)
        ) || null

      );

    }


    return null;

  }


  // ===================================================
  // IMAGE AUTO SLIDER
  // ===================================================

  private startImageAutoSlide(): void {

    this.stopImageAutoSlide();

    this.imageAutoSlideInterval =
      setInterval(() => {

        const images =
          this.getImages(this.vehicle());

        if (images.length > 1) {
          this.nextImage();
        }

      }, 3000);

  }


  private stopImageAutoSlide(): void {

    if (this.imageAutoSlideInterval) {

      clearInterval(
        this.imageAutoSlideInterval
      );

      this.imageAutoSlideInterval = null;

    }

  }


  // ===================================================
  // DESTROY
  // ===================================================

  ngOnDestroy(): void {
    this.stopImageAutoSlide();
  }


  // ===================================================
  // NAME - TEXT ONLY
  // ===================================================

  onlyText(
    field:
      'finance' |
      'testDrive' |
      'inspection'
  ): void {

    if (field === 'finance') {

      this.financeForm.name =
        (this.financeForm.name || '')
          .replace(/[^A-Za-z ]/g, '');

    }

    if (field === 'testDrive') {

      this.testDriveForm.name =
        (this.testDriveForm.name || '')
          .replace(/[^A-Za-z ]/g, '');

    }

    if (field === 'inspection') {

      this.inspectionForm.name =
        (this.inspectionForm.name || '')
          .replace(/[^A-Za-z ]/g, '');

    }

  }


  // ===================================================
  // MOBILE - NUMBER ONLY / MAX 10 DIGITS
  // ===================================================

  onlyNumber(
    field:
      'finance' |
      'testDrive' |
      'inspection'
  ): void {

    if (field === 'finance') {

      this.financeForm.phone =
        (this.financeForm.phone || '')
          .replace(/[^0-9]/g, '')
          .slice(0, 10);

    }

    if (field === 'testDrive') {

      this.testDriveForm.phone =
        (this.testDriveForm.phone || '')
          .replace(/[^0-9]/g, '')
          .slice(0, 10);

    }

    if (field === 'inspection') {

      this.inspectionForm.phone =
        (this.inspectionForm.phone || '')
          .replace(/[^0-9]/g, '')
          .slice(0, 10);

    }

  }


  // ===================================================
  // GET IMAGES
  // ===================================================

  getImages(
    vehicle?: Vehicle | null
  ): VehicleImage[] {

    if (!vehicle) {

      return [];

    }


    if (
      vehicle.images &&
      vehicle.images.length
    ) {

      return this.sortImages(vehicle.images);

    }


    if (
      vehicle.car_images &&
      vehicle.car_images.length
    ) {

      return this.sortImages(vehicle.car_images);

    }


    if (
      vehicle.vehicle_images &&
      vehicle.vehicle_images.length
    ) {

      return this.sortImages(vehicle.vehicle_images);

    }


    return [];

  }


  // ===================================================
  // LOAD PUBLIC VEHICLE IMAGES
  // ===================================================
  // The details API and the image API are intentionally
  // handled separately. This keeps all existing vehicle
  // details/forms intact while ensuring the main image
  // comes from the actual uploaded vehicle images.
  // ===================================================

  private loadVehicleImages(
    carId: number
  ): void {

    if (!carId) {
      return;
    }

    this.http
      .get<any>(
        `${this.apiUrl}/vehicles/${carId}/images`
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Vehicle Images API:',
            response
          );

          const images =
            this.extractImages(response);

          if (!images.length) {

            console.warn(
              'No vehicle images returned for car:',
              carId
            );

            return;
          }

          const currentVehicle =
            this.vehicle();

          if (!currentVehicle) {
            return;
          }

          const sortedImages =
            this.sortImages(images);

          this.vehicle.set({
            ...currentVehicle,
            images: sortedImages,
            car_images: sortedImages,
            vehicle_images: sortedImages
          });

          // Primary image is always the first image.
          this.activeImageIndex.set(0);

          console.log(
            'Vehicle images loaded:',
            sortedImages
          );

        },

        error: (apiError) => {

          // Do not break the details page if the separate
          // image endpoint is unavailable. Embedded images
          // from the vehicle response will still be used.
          console.warn(
            'Vehicle images endpoint failed. Using embedded vehicle images if available.',
            apiError
          );

        }

      });

  }


  // ===================================================
  // EXTRACT IMAGE ARRAY FROM ANY PUBLIC API SHAPE
  // ===================================================

  private extractImages(
    response: any
  ): VehicleImage[] {

    if (!response) {
      return [];
    }

    const candidates: any[] = [
      response?.data?.images,
      response?.data?.vehicle_images,
      response?.data?.car_images,
      response?.data?.data?.images,
      response?.images,
      response?.vehicle_images,
      response?.car_images,
      response?.data
    ];

    for (const candidate of candidates) {

      if (Array.isArray(candidate)) {

        return candidate
          .map((item: any) =>
            this.normalizeImage(item)
          )
          .filter(
            (item: VehicleImage | null): item is VehicleImage =>
              !!item && !!this.getRawImagePath(item)
          );

      }

    }

    // Some APIs return one image object instead of an array.
    const single =
      response?.data?.image ||
      response?.image ||
      response?.data?.vehicle_image;

    if (single) {
      const normalized =
        this.normalizeImage(single);

      return normalized &&
        this.getRawImagePath(normalized)
        ? [normalized]
        : [];
    }

    return [];

  }


  // ===================================================
  // NORMALIZE IMAGE OBJECT
  // ===================================================

  private normalizeImage(
    item: any
  ): VehicleImage | null {

    if (!item) {
      return null;
    }

    if (typeof item === 'string') {
      return {
        image_path: item
      };
    }

    return {
      ...item,
      image_id: item.image_id ?? item.id,
      car_id: item.car_id ?? item.vehicle_id,
      image_type: item.image_type ?? item.type,
      image_path:
        item.image_path ??
        item.image_url ??
        item.imageUrl ??
        item.url ??
        item.path ??
        item.src ??
        item.filename ??
        item.file_name,
      image_url:
        item.image_url ??
        item.imageUrl ??
        item.url,
      is_primary:
        item.is_primary ??
        item.isPrimary ??
        item.primary
    };

  }


  // ===================================================
  // SORT IMAGES - PRIMARY FIRST
  // ===================================================

  private sortImages(
    images: VehicleImage[]
  ): VehicleImage[] {

    return [...images]
      .filter(
        image => !!this.getRawImagePath(image)
      )
      .sort((a, b) => {

        const aPrimary =
          a?.is_primary === true ||
          Number(a?.is_primary) === 1;

        const bPrimary =
          b?.is_primary === true ||
          Number(b?.is_primary) === 1;

        if (aPrimary && !bPrimary) {
          return -1;
        }

        if (!aPrimary && bPrimary) {
          return 1;
        }

        return (
          Number(a?.image_id || 0) -
          Number(b?.image_id || 0)
        );

      });

  }


  // ===================================================
  // RAW IMAGE PATH
  // ===================================================

  private getRawImagePath(
    image?: VehicleImage | null
  ): string {

    if (!image) {
      return '';
    }

    return String(
      image.image_path ??
      image.image_url ??
      image.imageUrl ??
      image.url ??
      image.path ??
      image.src ??
      image.filename ??
      image.file_name ??
      ''
    ).trim();

  }


  // ===================================================
  // IMAGE URL
  // ===================================================

  getImageUrl(
    image?: VehicleImage
  ): string {

    const rawPath =
      this.getRawImagePath(image);

    if (!rawPath) {
      return this.getFallbackImage();
    }

    let imagePath =
      rawPath.replace(/\\/g, '/').trim();

    // Already a complete URL.
    if (
      imagePath.startsWith('http://') ||
      imagePath.startsWith('https://')
    ) {
      return imagePath;
    }

    // Protocol-relative URL.
    if (imagePath.startsWith('//')) {
      return `http:${imagePath}`;
    }

    // Backend sometimes returns the complete localhost
    // host without a protocol.
    if (
      imagePath.startsWith('localhost:5000/')
    ) {
      return `http://${imagePath}`;
    }

    // Normalize paths returned by Express.
    if (!imagePath.startsWith('/')) {
      imagePath = `/${imagePath}`;
    }

    // If only a filename or uploads-relative path is returned,
    // the backend static uploads route is still the source.
    return `https://dependable-determination-production-434d.up.railway.app${imagePath}`;

  }


  // ===================================================
  // FALLBACK IMAGE
  // ===================================================

  getFallbackImage(): string {

    return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85';

  }


  // ===================================================
  // MAIN IMAGE
  // ===================================================

  getMainImage(): string {

    const currentVehicle =
      this.vehicle();


    const images =
      this.getImages(
        currentVehicle
      );


    if (!images.length) {

      return this.getFallbackImage();

    }


    const index =
      this.activeImageIndex() %
      images.length;


    return this.getImageUrl(
      images[index]
    );

  }


  // ===================================================
  // CHANGE IMAGE
  // ===================================================

  changeImage(
    index: number
  ): void {

    this.activeImageIndex.set(
      index
    );

  }


  // ===================================================
  // PREVIOUS IMAGE
  // ===================================================

  previousImage(): void {

    const images =
      this.getImages(
        this.vehicle()
      );


    if (!images.length) {

      return;

    }


    this.activeImageIndex.update(
      index => {

        if (index <= 0) {

          return images.length - 1;

        }

        return index - 1;

      }
    );

  }


  // ===================================================
  // NEXT IMAGE
  // ===================================================

  nextImage(): void {

    const images =
      this.getImages(
        this.vehicle()
      );


    if (!images.length) {

      return;

    }


    this.activeImageIndex.update(
      index =>
        (index + 1) %
        images.length
    );

  }


  // ===================================================
  // PRICE
  // ===================================================

  formatPrice(
    price?: number
  ): string {

    if (
      price === undefined ||
      price === null
    ) {

      return '₹0';

    }


    return new Intl.NumberFormat(
      'en-IN',
      {

        style: 'currency',

        currency: 'INR',

        maximumFractionDigits: 0

      }
    ).format(price);

  }


  // ===================================================
  // ODOMETER
  // ===================================================

  formatOdometer(
    odometer?: number
  ): string {

    if (
      odometer === undefined ||
      odometer === null
    ) {

      return '—';

    }


    return new Intl.NumberFormat(
      'en-IN'
    ).format(
      odometer
    );

  }


  // ===================================================
  // LISTING STATUS
  // ===================================================

  getListingStatus(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.listing_status ||

      vehicle.status ||

      '—'

    );

  }


  // ===================================================
  // PUBLISHED
  // ===================================================

  isPublished(
    vehicle?: Vehicle | null
  ): boolean {

    if (!vehicle) {

      return false;

    }


    const status =
      vehicle.listing_status ||
      vehicle.status ||
      '';


    return (

      status
        .toLowerCase()
        .trim() === 'published'

    );

  }


  // ===================================================
  // OVERALL SCORE
  // ===================================================

  getOverallScore(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    const score =
      vehicle.overall_score ??
      vehicle.inspection_score ??
      vehicle.score;


    if (
      score === undefined ||
      score === null
    ) {

      return '—';

    }


    return `${score}/10`;

  }


  // ===================================================
  // OWNER CLASSIFICATION
  // ===================================================

  getOwnerClassification(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.owner_classification ||

      vehicle.owner_type ||

      vehicle.ownership ||

      '—'

    );

  }


  // ===================================================
  // LOCATION
  // ===================================================

  getLocation(
    vehicle?: Vehicle | null
  ): string {

    if (!vehicle) {

      return '—';

    }


    return (

      vehicle.location ||

      vehicle.city ||

      '—'

    );

  }


  // ===================================================
  // FINANCE
  // ===================================================

  openFinance(): void {

    this.activeTab.set(
      'finance'
    );

    this.showFinanceForm.set(
      true
    );

  }


  closeFinance(): void {

    this.showFinanceForm.set(
      false
    );

    this.activeTab.set(
      'price'
    );

  }


  // ===================================================
  // TEST DRIVE
  // ===================================================

  openTestDrive(): void {

    this.showTestDriveForm.set(
      true
    );

  }


  closeTestDrive(): void {

    this.showTestDriveForm.set(
      false
    );

  }


  // ===================================================
  // INSPECTION
  // ===================================================

  openInspection(): void {

    this.showInspectionForm.set(
      true
    );

  }


  closeInspection(): void {

    this.showInspectionForm.set(
      false
    );

  }


  // ===================================================
// FINANCE SUBMIT
// ===================================================

submitFinance(): void {

  const vehicle = this.vehicle();

  if (!vehicle?.car_id) {
    alert('Vehicle information is not available.');
    return;
  }

  const name = String(this.financeForm.name || '').trim();
  const mobile = String(this.financeForm.phone || '').trim();
  const email = String(this.financeForm.email || '').trim().toLowerCase();
  const occupation = String(this.financeForm.occupation || '').trim();
  const monthlyIncome = Number(this.financeForm.monthlyIncome);
  const downPayment = Number(this.financeForm.downPayment);

  if (!name) {
    alert('Name is required.');
    return;
  }

  if (!/^[A-Za-z ]{2,100}$/.test(name)) {
    alert('Name must contain only letters and spaces.');
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert('Mobile number must contain exactly 10 digits.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Invalid email address.');
    return;
  }

  if (!occupation) {
    alert('Occupation is required.');
    return;
  }

  if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0) {
    alert('Monthly income must be greater than 0.');
    return;
  }

  if (!Number.isFinite(downPayment) || downPayment < 0) {
    alert('Down payment cannot be negative.');
    return;
  }

  const payload = {
    carId: Number(vehicle.car_id),
    name,
    mobile,
    email,
    occupation,
    monthlyIncome,
    downPayment
  };

  console.log('Finance Payload:', payload);

  this.submitting.set(true);
  this.submitError.set('');
  this.submitSuccess.set('');

  this.http
    .post(`${this.apiUrl}/vehicles/${vehicle.car_id}/finance`, payload)
    .subscribe({
      next: (response: any) => {
        console.log('Finance Request Saved:', response);
        this.submitting.set(false);
        this.submitSuccess.set('Finance request submitted successfully.');
        alert(response?.message || 'Finance details submitted successfully.');
        this.showFinanceForm.set(false);

        this.financeForm = {
          name: '',
          phone: '',
          email: '',
          monthlyIncome: '',
          occupation: '',
          downPayment: ''
        };
      },
      error: (error) => {
        console.error('Finance Request Error:', error);
        this.submitting.set(false);
        const message = error?.error?.message || 'Unable to submit finance request.';
        this.submitError.set(message);
        alert(message);
      }
    });

}


// ===================================================
// TEST DRIVE SUBMIT
// ===================================================

submitTestDrive(): void {

  const vehicle = this.vehicle();

  if (!vehicle?.car_id) {
    alert('Vehicle information is not available.');
    return;
  }

  const name = String(this.testDriveForm.name || '').trim();
  const mobile = String(this.testDriveForm.phone || '').trim();
  const email = String(this.testDriveForm.email || '').trim().toLowerCase();
  const city = String(this.testDriveForm.city || '').trim();
  const preferredDate = String(this.testDriveForm.preferredDate || '').trim();
  const preferredTime = String(this.testDriveForm.preferredTime || '').trim();

  if (!/^[A-Za-z ]{2,100}$/.test(name)) {
    alert('Name must contain only letters and spaces.');
    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert('Mobile number must contain exactly 10 digits.');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!city) {
    alert('City is required.');
    return;
  }

  if (!preferredDate) {
    alert('Preferred date is required.');
    return;
  }

  if (!preferredTime) {
    alert('Preferred time is required.');
    return;
  }

  const payload = {
    carId: Number(vehicle.car_id),
    name,
    mobile,
    email,
    city,
    preferredDate,
    preferredTime
  };

  console.log('Test Drive Payload:', payload);

  this.submitting.set(true);
  this.submitError.set('');
  this.submitSuccess.set('');

  this.http
    .post(`${this.apiUrl}/vehicles/${vehicle.car_id}/test-drive`, payload)
    .subscribe({
      next: (response: any) => {
        console.log('Test Drive Request Saved:', response);
        this.submitting.set(false);
        this.submitSuccess.set('Test drive request submitted successfully.');
        alert(response?.message || 'Test drive request submitted successfully.');
        this.showTestDriveForm.set(false);

        this.testDriveForm = {
          name: '',
          phone: '',
          email: '',
          preferredDate: '',
          preferredTime: '',
          city: ''
        };
      },
      error: (error) => {
        console.error('Test Drive Request Error:', error);
        this.submitting.set(false);
        const message = error?.error?.message || 'Unable to submit test drive request.';
        this.submitError.set(message);
        alert(message);
      }
    });

}


// ===================================================
// INSPECTION SUBMIT
// ===================================================

// ===================================================
// INSPECTION / UNLOCK REPORT SUBMIT
// ===================================================

submitInspection(): void {

  const vehicle = this.vehicle();

  // =================================================
  // CAR ID
  // =================================================

  const carId = Number(vehicle?.car_id);

  if (!Number.isInteger(carId) || carId <= 0) {

    alert('Vehicle information is not available.');

    return;
  }


  // =================================================
  // GET FORM VALUES
  // =================================================

  const name =
    String(this.inspectionForm.name || '').trim();

  const mobile =
    String(this.inspectionForm.phone || '')
      .trim()
      .replace(/\s/g, '');

  const email =
    String(this.inspectionForm.email || '')
      .trim()
      .toLowerCase();


  // =================================================
  // NAME VALIDATION
  // =================================================

  if (!name) {

    alert('Name is required.');

    return;
  }

  if (!/^[A-Za-z ]+$/.test(name)) {

    alert('Name should contain only letters and spaces.');

    return;
  }

  if (name.length < 2 || name.length > 100) {

    alert('Name must be between 2 and 100 characters.');

    return;
  }


  // =================================================
  // MOBILE VALIDATION
  // =================================================

  if (!mobile) {

    alert('Mobile number is required.');

    return;
  }

  if (!/^[0-9]{10}$/.test(mobile)) {

    alert('Mobile number must contain exactly 10 digits.');

    return;
  }


  // =================================================
  // EMAIL VALIDATION
  // =================================================

  if (!email) {

    alert('Email is required.');

    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

    alert('Please enter a valid email address.');

    return;
  }


  // =================================================
  // EXACT PAYLOAD FOR BACKEND
  // =================================================
  // Backend ko sirf ye 4 fields bhejni hain:
  // carId
  // name
  // mobile
  // email

  const payload = {

    carId: carId,

    name: name,

    mobile: mobile,

    email: email

  };


  // =================================================
  // DEBUG
  // =================================================

  console.log(
    'FINAL REPORT UNLOCK PAYLOAD:',
    payload
  );


  // =================================================
  // SUBMIT START
  // =================================================

  this.submitting.set(true);

  this.submitError.set('');

  this.submitSuccess.set('');


  // =================================================
  // API REQUEST
  // =================================================

  this.http
    .post(
      `${this.apiUrl}/vehicles/${carId}/unlock-report`,
      payload
    )
    .subscribe({

      // ===============================================
      // SUCCESS
      // ===============================================

      next: (response: any) => {

        console.log(
          'REPORT UNLOCK SUCCESS:',
          response
        );

        this.submitting.set(false);


        this.submitSuccess.set(
          response?.message ||
          'Inspection report unlock request submitted successfully.'
        );


        alert(
          response?.message ||
          'Inspection report unlock request submitted successfully.'
        );


        // CLOSE MODAL

        this.showInspectionForm.set(false);


        // RESET FORM

        this.inspectionForm = {

          name: '',

          phone: '',

          email: ''

        };

      },


      // ===============================================
      // ERROR
      // ===============================================

      error: (error) => {

        console.error(
          'REPORT UNLOCK ERROR:',
          error
        );

        console.error(
          'SERVER RESPONSE:',
          error?.error
        );


        this.submitting.set(false);


        const message =
          error?.error?.message ||
          error?.error?.error ||
          'Validation failed.';


        this.submitError.set(message);


        alert(message);

      }

    });

}
  // ===================================================
  // CLOSE ALL
  // ===================================================

  closeAllForms(): void {

    this.showFinanceForm.set(false);

    this.showTestDriveForm.set(false);

    this.showInspectionForm.set(false);

  }

}