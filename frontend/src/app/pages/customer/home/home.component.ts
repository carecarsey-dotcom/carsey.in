import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';


// =====================================================
// VEHICLE IMAGE INTERFACE
// =====================================================

interface VehicleImage {

  image_id?: number;

  car_id?: number;

  image_type?: string;

  image_path?: string;

  is_primary?: number | boolean;

}


// =====================================================
// VEHICLE INTERFACE
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

  status?: string;

  published_at?: string;

  images?: VehicleImage[];

  car_images?: VehicleImage[];

  vehicle_images?: VehicleImage[];

}


// =====================================================
// API RESPONSE
// =====================================================

interface VehicleResponse {

  success: boolean;

  message?: string;

  data?:
    | Vehicle[]
    | {
        vehicles?: Vehicle[];
        vehicle?: Vehicle;
      };

  vehicles?: Vehicle[];

  pagination?: {

    page?: number;

    limit?: number;

    total?: number;

    totalPages?: number;

  };

}


// =====================================================
// COMPONENT
// =====================================================

@Component({

  selector: 'app-customer-home',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './home.component.html',

  styleUrl: './home.component.css'

})


export class HomeComponent
  implements OnInit, OnDestroy {


// ===================================================
// HTTP
// ===================================================

  private http =
    inject(HttpClient);


// ===================================================
// API URL
// ===================================================

 private apiUrl =
  'https://carseyin-production.up.railway.app/api';


// ===================================================
// HERO IMAGES
// ===================================================

  carImages: string[] = [

    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80',

    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80',

    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',

    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1920&q=80',

    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1920&q=80'

  ];


// ===================================================
// CURRENT HERO IMAGE
// ===================================================

  currentImageIndex =
    signal(0);


// ===================================================
// PUBLISHED VEHICLES
// ===================================================

  vehicles =
    signal<Vehicle[]>([]);


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
// FILTER VALUES
// ===================================================

  selectedBrand =
    signal('all');


  selectedFuel =
    signal('all');


  selectedTransmission =
    signal('all');


  selectedPrice =
    signal('all');


// ===================================================
// SEARCH
// ===================================================

  searchQuery =
    signal('');


// ===================================================
// VIEW MORE
//
// Initially 10 cars.
// Every click adds 10 more cars.
// ===================================================

  carsToShow =
    signal(10);


  readonly carsPerClick = 10;


// ===================================================
// CARD IMAGE INDEX
//
// Every car has its own image index.
// ===================================================

  cardImageIndexes =
    signal<Record<number, number>>({});


// ===================================================
// INTERVALS
// ===================================================

  private heroInterval:
    ReturnType<typeof setInterval> | null = null;


  private cardInterval:
    ReturnType<typeof setInterval> | null = null;


// ===================================================
// COMPONENT INIT
// ===================================================

  ngOnInit(): void {

    this.startHeroSlider();

    this.loadPublishedVehicles();

    this.startCardImageSlider();

  }


// ===================================================
// LOAD ALL PUBLISHED VEHICLES
//
// Backend default 10 deta hai.
// Isliye yahan limit=100 bhej rahe hain.
//
// ===================================================

  loadPublishedVehicles(): void {

    this.loading.set(true);

    this.error.set('');

    this.carsToShow.set(10);


    this.http
      .get<VehicleResponse>(
        `${this.apiUrl}/vehicles/published?limit=100`
      )

      .subscribe({

        // =============================================
        // SUCCESS
        // =============================================

        next: (response) => {

          console.log(
            'Published Vehicles API Response:',
            response
          );

let vehicleList: Vehicle[] = [];


// =====================================================
// RESPONSE STRUCTURE 1
// BACKEND RETURNS:
// data: [ ...vehicles ]
// =====================================================

if (
  Array.isArray(response?.data)
) {

  vehicleList =
    response.data;

}


// =====================================================
// RESPONSE STRUCTURE 2
// BACKEND RETURNS:
// data: { vehicles: [...] }
// =====================================================

else if (
  response?.data &&
  !Array.isArray(response.data) &&
  Array.isArray(response.data.vehicles)
) {

  vehicleList =
    response.data.vehicles;

}


// =====================================================
// RESPONSE STRUCTURE 3
// BACKEND RETURNS:
// vehicles: [...]
// =====================================================

else if (
  Array.isArray(response?.vehicles)
) {

  vehicleList =
    response.vehicles;

}


          // ===========================================
          // IMPORTANT FIX
          // ===========================================
          //
          // Yahan pehle:
          //
          // vehicleList.filter(
          //   vehicle =>
          //     vehicle.status?.toLowerCase() ===
          //     'published'
          // );
          //
          // laga hua tha.
          //
          // Backend ka /published endpoint already
          // published vehicles return karta hai.
          //
          // Agar database mein status:
          //
          // Yes
          // Publish
          // Active
          // Published
          //
          // etc. ho to frontend wala extra filter
          // vehicle ko hata deta tha.
          //
          // Isliye backend se aayi list ko direct use
          // kar rahe hain.
          // ===========================================


          console.log(
            'Vehicles received from backend:',
            vehicleList.length
          );


          console.log(
            'Vehicles:',
            vehicleList
          );


          // ===========================================
          // SET ALL PUBLISHED VEHICLES
          // ===========================================

          this.vehicles.set(
            vehicleList
          );


          // ===========================================
          // RESET IMAGE INDEXES
          // ===========================================

          const indexes:
            Record<number, number> = {};


          vehicleList.forEach(
            vehicle => {

              indexes[
                vehicle.car_id
              ] = 0;

            }
          );


          this.cardImageIndexes.set(
            indexes
          );


          // ===========================================
          // LOADING COMPLETE
          // ===========================================

          this.loading.set(false);

        },


        // =============================================
        // ERROR
        // =============================================

        error: (error) => {

          console.error(
            'Published vehicle API error:',
            error
          );


          this.error.set(
            'Unable to load vehicles right now.'
          );


          this.loading.set(false);

        }

      });

  }


// ===================================================
// HERO SLIDER
// ===================================================

  private startHeroSlider(): void {

    this.heroInterval =
      setInterval(() => {

        this.currentImageIndex.update(
          index =>
            (
              index + 1
            ) %
            this.carImages.length
        );

      }, 3500);

  }


// ===================================================
// CARD IMAGE SLIDER
//
// Every 5 seconds every car changes image.
// ===================================================

  private startCardImageSlider(): void {

    this.cardInterval =
      setInterval(() => {

        const currentIndexes =
          this.cardImageIndexes();


        const updatedIndexes:
          Record<number, number> = {

            ...currentIndexes

          };


        this.vehicles().forEach(
          vehicle => {

            const images =
              this.getVehicleImages(
                vehicle
              );


            // ========================================
            // MULTIPLE IMAGES
            // ========================================

            if (
              images.length > 1
            ) {

              const currentIndex =
                currentIndexes[
                  vehicle.car_id
                ] ?? 0;


              updatedIndexes[
                vehicle.car_id
              ] =
                (
                  currentIndex + 1
                ) %
                images.length;

            }


            // ========================================
            // SINGLE / NO IMAGE
            // ========================================

            else {

              updatedIndexes[
                vehicle.car_id
              ] = 0;

            }

          }
        );


        this.cardImageIndexes.set(
          updatedIndexes
        );


      }, 5000);

  }


// ===================================================
// FILTERED VEHICLES
// ===================================================

  get filteredVehicles(): Vehicle[] {

    return this.vehicles().filter(
      vehicle => {


        // ==========================================
        // SEARCH
        // ==========================================

        const search =
          this.searchQuery()
            .trim()
            .toLowerCase();


        const searchableText = [

          vehicle.brand,

          vehicle.model,

          vehicle.variant,

          vehicle.city,

          vehicle.fuel_type,

          vehicle.transmission,

          vehicle.manufacturing_year?.toString(),

          vehicle.price?.toString()

        ]

          .filter(Boolean)

          .join(' ')

          .toLowerCase();


        const searchMatch =
          !search ||
          searchableText.includes(search);


        // ==========================================
        // BRAND
        // ==========================================

        const brandMatch =

          this.selectedBrand() === 'all' ||

          vehicle.brand?.toLowerCase() ===
          this.selectedBrand().toLowerCase();


        // ==========================================
        // FUEL
        // ==========================================

        const fuelMatch =

          this.selectedFuel() === 'all' ||

          vehicle.fuel_type?.toLowerCase() ===
          this.selectedFuel().toLowerCase();


        // ==========================================
        // TRANSMISSION
        // ==========================================

        const transmissionMatch =

          this.selectedTransmission() === 'all' ||

          vehicle.transmission?.toLowerCase() ===
          this.selectedTransmission().toLowerCase();


        // ==========================================
        // PRICE
        // ==========================================

        let priceMatch = true;


        const price =
          Number(
            vehicle.price || 0
          );


        // UNDER 5 LAKH

        if (
          this.selectedPrice() === 'under5'
        ) {

          priceMatch =
            price <= 500000;

        }


        // 5 TO 10 LAKH

        else if (
          this.selectedPrice() === '5to10'
        ) {

          priceMatch =
            price > 500000 &&
            price <= 1000000;

        }


        // 10 TO 20 LAKH

        else if (
          this.selectedPrice() === '10to20'
        ) {

          priceMatch =
            price > 1000000 &&
            price <= 2000000;

        }


        // ABOVE 20 LAKH

        else if (
          this.selectedPrice() === 'above20'
        ) {

          priceMatch =
            price > 2000000;

        }


        return (

          searchMatch &&

          brandMatch &&

          fuelMatch &&

          transmissionMatch &&

          priceMatch

        );

      }

    );

  }


// ===================================================
// CARS CURRENTLY VISIBLE
//
// First 10.
// View More click -> next 10.
// ===================================================

  get visibleVehicles(): Vehicle[] {

    return this.filteredVehicles.slice(

      0,

      this.carsToShow()

    );

  }


// ===================================================
// SHOW VIEW MORE BUTTON?
// ===================================================

  get canShowMoreCars(): boolean {

    return (

      this.carsToShow() <

      this.filteredVehicles.length

    );

  }


// ===================================================
// VIEW MORE CARS
// ===================================================

  viewMoreCars(): void {

    const nextLimit =
      this.carsToShow() +
      this.carsPerClick;


    this.carsToShow.set(

      Math.min(

        nextLimit,

        this.filteredVehicles.length

      )

    );

  }


// ===================================================
// RESET FILTERS
// ===================================================

  resetFilters(): void {

    this.selectedBrand.set(
      'all'
    );


    this.selectedFuel.set(
      'all'
    );


    this.selectedTransmission.set(
      'all'
    );


    this.selectedPrice.set(
      'all'
    );


    this.searchQuery.set('');


    // Filter reset hone par
    // phir first 10 cars se start karo.

    this.carsToShow.set(10);

  }


// ===================================================
// GET VEHICLE IMAGES
//
// Supports:
// images
// car_images
// vehicle_images
// ===================================================

  getVehicleImages(
    vehicle: Vehicle
  ): VehicleImage[] {


    // ================================================
    // images
    // ================================================

    if (

      vehicle.images &&

      vehicle.images.length

    ) {

      return vehicle.images;

    }


    // ================================================
    // car_images
    // ================================================

    if (

      vehicle.car_images &&

      vehicle.car_images.length

    ) {

      return vehicle.car_images;

    }


    // ================================================
    // vehicle_images
    // ================================================

    if (

      vehicle.vehicle_images &&

      vehicle.vehicle_images.length

    ) {

      return vehicle.vehicle_images;

    }


    return [];

  }


// ===================================================
// GET CARD IMAGE
// ===================================================

  getCardImage(
    vehicle: Vehicle
  ): string {

    const images =
      this.getVehicleImages(
        vehicle
      );


    // ================================================
    // NO IMAGE
    // ================================================

    if (
      !images.length
    ) {

      return (

        'https://images.unsplash.com/' +

        'photo-1492144534655-ae79c964c9d7' +

        '?auto=format&fit=crop&w=1000&q=80'

      );

    }


    // ================================================
    // CURRENT INDEX
    // ================================================

    const currentIndex =
      this.cardImageIndexes()[

        vehicle.car_id

      ] ?? 0;


    // ================================================
    // SELECT IMAGE
    // ================================================

    const selectedImage =
      images[

        currentIndex %

        images.length

      ];


    // ================================================
    // IMAGE PATH
    // ================================================

    const imagePath =
      selectedImage?.image_path;


    // ================================================
    // NO IMAGE PATH
    // ================================================

    if (
      !imagePath
    ) {

      return (

        'https://images.unsplash.com/' +

        'photo-1492144534655-ae79c964c9d7' +

        '?auto=format&fit=crop&w=1000&q=80'

      );

    }


    // ================================================
    // ALREADY FULL URL
    // ================================================

    if (

      imagePath.startsWith(
        'http://'
      ) ||

      imagePath.startsWith(
        'https://'
      )

    ) {

      return imagePath;

    }


    // ================================================
    // BACKEND IMAGE URL
    // ================================================

 return (
  `https://carseyin-production.up.railway.app${imagePath}`
);

  }


// ===================================================
// FORMAT PRICE
// ===================================================

  formatPrice(
    price?: number
  ): string {

    if (!price) {

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
// COMPONENT DESTROY
// ===================================================

  ngOnDestroy(): void {


    if (
      this.heroInterval
    ) {

      clearInterval(
        this.heroInterval
      );

    }


    if (
      this.cardInterval
    ) {

      clearInterval(
        this.cardInterval
      );

    }

  }

}