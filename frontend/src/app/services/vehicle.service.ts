import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';



// =====================================================
// VEHICLE INTERFACE
// =====================================================

export interface Vehicle {

  car_id: number;

  // ===================================================
  // MASTER INSPECTION BOOKING ID
  // ===================================================
  booking_id?: number | null;

  owner_id?: number;

  brand: string;

  model: string;

  variant?: string;

  manufacturing_year?: number;

  price?: number | null;

  price_short_note?: string;

  odometer?: number;

  fuel_type?: string;

  transmission?: string;

  owner_classification?: string;

  registration_number?: string;

  chassis_number?: string;

  engine_number?: string;

  city?: string;

  inspection_date?: string;

  rto?: string;

  spare_key?: string;

  insurance_type?: string;

  insurance_validity?: string;

  vehicle_note?: string;

  status?: string;

  created_at?: string;

  updated_at?: string;

  published_at?: string;

}



// =====================================================
// CUSTOMER / OWNER DETAILS
// ADD VEHICLE FORM SUPPORT
// =====================================================

export interface VehicleOwnerDetails {

  customer_name?: string | null;

  owner_mobile?: string | null;

  alternate_mobile?: string | null;

  owner_email?: string | null;

  owner_address?: string | null;

  owner_city?: string | null;

  owner_state?: string | null;

  owner_pincode?: string | null;

  aadhar_number?: string | null;

  pan_number?: string | null;

}



// =====================================================
// INSPECTION CHECKLIST ITEM
// =====================================================

export interface InspectionChecklistItem {

  status?: string;

  remark?: string;

}



// =====================================================
// EDIT VEHICLE CHECKLIST ITEM
//
// edit-vehicle.component.ts imports ChecklistItem
// =====================================================

export interface ChecklistItem {

  status: string;

  remark: string;

}



// =====================================================
// INSPECTION CHECKLIST
// =====================================================

export interface InspectionChecklist {

  exterior?: InspectionChecklistItem;

  interior_electricals?: InspectionChecklistItem;

  engine_bay?: InspectionChecklistItem;

  transmission_system?: InspectionChecklistItem;

  suspension_steering?: InspectionChecklistItem;

  braking_system?: InspectionChecklistItem;

  tires_wheels?: InspectionChecklistItem;

  electricals_ac?: InspectionChecklistItem;

  documents_title?: InspectionChecklistItem;

  [key: string]: InspectionChecklistItem | undefined;

}



// =====================================================
// DETAILED INSPECTION
// =====================================================

export interface DetailedInspection {

  [sectionKey: string]: {

    [rowName: string]: string[];

  };

}



// =====================================================
// INSPECTION ROW
//
// Used by Edit Vehicle inspectionSections
// =====================================================

export type InspectionRow = [

  string,

  string[]

];



// =====================================================
// INSPECTION SECTION
//
// Used by edit-vehicle.component.ts
// =====================================================

export interface InspectionSection {

  key: string;

  title: string;

  rows: InspectionRow[];

}



// =====================================================
// ADD VEHICLE PAYLOAD
//
// Ye interface ADD VEHICLE ke liye hai.
// =====================================================

export interface AddVehiclePayload
  extends VehicleOwnerDetails {

  // ===================================================
  // VEHICLE DETAILS
  // ===================================================

  brand: string;

  model: string;

  variant?: string | null;

  manufacturing_year?: number | null;

  price?: number | null;

  price_short_note?: string | null;

  variant_short_note?: string | null;

  odometer?: number | null;

  fuel_type?: string | null;

  transmission?: string | null;

  owner_classification?: string | null;

  registration_number?: string | null;

  registration_rto_short_note?: string | null;

  chassis_number?: string | null;

  engine_number?: string | null;

  city?: string | null;

  inspection_date?: string | null;

  rto?: string | null;

  spare_key?: string | null;

  insurance_type?: string | null;

  insurance_validity?: string | null;

  vehicle_note?: string | null;

  status?: string | null;



  // ===================================================
  // INSPECTION DETAILS
  // ===================================================

  engine_remark?: string | null;

  overall_remark?: string | null;

  overall_score?: number | null;

  inspection_checklist?:
    InspectionChecklist | null;

  detailedInspection?:
    DetailedInspection | null;

}



// =====================================================
// VEHICLE RESPONSE
// =====================================================

export interface VehicleResponse {

  success: boolean;

  message: string;

  data: {

    vehicleId?: number;

    reportId?: number;

    vehicles?: Vehicle[];

    vehicle?: Vehicle;

    owner?: any;

    inspection?: any;

    checklist?: any;

    detailedInspection?:
      DetailedInspection | any;

    reports?: any[];

    pagination?: {

      page: number;

      limit: number;

      total: number;

      totalPages: number;

    };

    message?: string;

  };

}



// =====================================================
// VEHICLE IMAGE TYPE
// =====================================================

export interface VehicleImage {

  type: string;

  file: File | null;

  preview: string;

  // ---------------------------------------------------
  // EDIT VEHICLE IMAGE POSITION
  // ---------------------------------------------------

  row?: string;

  column?: number;

}



// =====================================================
// VEHICLE SERVICE
// =====================================================

@Injectable({

  providedIn: 'root'

})

export class VehicleService {



  // =====================================================
  // HTTP CLIENT
  // =====================================================

  private http =
    inject(HttpClient);



  // =====================================================
  // API URL
  // =====================================================

  private apiUrl =
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1'))
      ? 'http://localhost:5000/api'
      : 'https://api.carsey.in/api';



  // =====================================================
  // INSPECTION SECTIONS
  //
  // Edit Vehicle component isi data ko use karta hai.
  // Existing inspection options ko preserve kiya gaya hai.
  // =====================================================

  readonly inspectionSections:
    InspectionSection[] = [

    // ===================================================
    // EXTERIOR + TYRE
    // ===================================================

    {
  key: 'exterior_tyre',

  title: 'EXTERIOR + TYRE',

  rows: [

    // ==================== FRONT SIDE ====================

    [
      'Front Bumper',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Scratch',
        'Rusted',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],

    [
      'Bonnet / Hood',
      [
        'OK',
        'Dent',
        'Scratch',
        'Rusting',
        'Scooper Not Working',
        'Crack / Hole'
      ]
    ],

    [
      'Front Windshield',
      [
        'OK',
        'Glass Crack',
        'Glass Chip',
        'Scratch',
        'Rubber Damage',
        'Water Leakage'
      ]
    ],

    [
      'Roof',
      [
        'OK',
        'Paint Mismatch + Faded',
        'Dent',
        'Crack / Hole',
        'Scratches',
        'Roof Rail Broken',
        'Sun Roof Not Working'
      ]
    ],

    [
      'Upper Cross Member',
      [
        'OK',
        'Rusting',
        'Damage',
        'Repaired / Welded'
      ]
    ],

    [
      'Apron RHS',
      [
        'OK',
        'Repaired / Welded',
        'Repainted',
        'Rusting',
        'Dent',
        'Crack / Hole'
      ]
    ],

    [
      'Apron LHS',
      [
        'OK',
        'Repaired / Welded',
        'Repainted',
        'Rusting',
        'Dent',
        'Crack / Hole'
      ]
    ],


    // ==================== RIGHT SIDE ====================

    [
      'RHS Fender',
      [
        'OK',
        'Dent',
        'Scratch',
        'Rusting',
        'Lug Missing'
      ]
    ],

    [
      'RHS Front Tyre',
      [
        'OK',
        'Tyre Crack',
        'Rim Rusting',
        'Wheel Cap Missing',
        'Lug Nut Missing'
      ]
    ],

    [
      'RHS Front Door',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Rusted',
        'Scratch',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],

    [
      'RHS ORVM',
      [
        'OK',
        'Scratch + Faded',
        'Mirror Crack',
        'Folding Motor Not Working',
        'Light Not Working'
      ]
    ],

    [
      'RHS A-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'RHS B-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'RHS C-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'RHS Rear Door',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Rusted',
        'Scratch',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],

    [
      'RHS Running Board',
      [
        'OK',
        'Scratches',
        'Dent',
        'Rusted',
        'Cladding Broken / Not Fixed Properly',
        'Paint Mismatch / Hole / Crack'
      ]
    ],

    [
      'RHS Rear Tyre',
      [
        'OK',
        'Tyre Crack',
        'Rim Rusting',
        'Wheel Cap Missing',
        'Lug Nut Missing'
      ]
    ],

    [
      'RHS Quarter Panel',
      [
        'OK',
        'Fuel Lid Lock Not Working',
        'Paint Issue + Mismatch + Faded',
        'Dent',
        'Rusting',
        'Scratches',
        'Repair + Repaint + Welded'
      ]
    ],


    // ==================== REAR SIDE ====================

    [
      'Dicky / Boot Door',
      [
        'OK',
        'Scratches',
        'Dent',
        'Rusted',
        'Boot Partial Missing',
        'Jack & Tools Missing',
        'Shocker Not Working',
        'Dicky Lock Not Working',
        'Spoiler Broken / Damage'
      ]
    ],

    [
      'Rear Windshield',
      [
        'OK',
        'Glass Crack',
        'Glass Chip',
        'Scratch',
        'Rubber Damage',
        'Water Leakage'
      ]
    ],

    [
      'Spare Tyre',
      [
        'OK',
        'Tyre Crack',
        'Rim Rusting',
        'Wheel Cap Missing',
        'Lug Nut Missing'
      ]
    ],

    [
      'Boot Floor',
      [
        'OK',
        'Water Logging',
        'Welded / Repaired',
        'Rusting',
        'Dent',
        'Hole & Crack'
      ]
    ],

    [
      'Rear Bumper',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Scratch',
        'Rusted',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],


    // ==================== LEFT SIDE ====================

    [
      'LHS Quarter Panel',
      [
        'OK',
        'Fuel Lid Lock Not Working',
        'Paint Issue + Mismatch + Faded',
        'Dent',
        'Rusting',
        'Scratches',
        'Repair + Repaint + Welded'
      ]
    ],

    [
      'LHS Rear Tyre',
      [
        'OK',
        'Tyre Crack',
        'Rim Rusting',
        'Wheel Cap Missing',
        'Lug Nut Missing'
      ]
    ],

    [
      'LHS Running Board',
      [
        'OK',
        'Scratches',
        'Dent',
        'Rusted',
        'Cladding Broken / Not Fixed Properly',
        'Paint Mismatch / Hole / Crack'
      ]
    ],

    [
      'LHS Rear Door',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Rusted',
        'Scratch',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],

    [
      'LHS C-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'LHS B-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'LHS A-Pillar',
      [
        'OK',
        'Paint Faded / Mismatch',
        'Scratches',
        'Dent',
        'Rusting',
        'Repaired + Welded'
      ]
    ],

    [
      'LHS Front Door',
      [
        'OK',
        'Broken/Crack',
        'Dented',
        'Rusted',
        'Scratch',
        'Paint Mismatch',
        'Repair + Repaint'
      ]
    ],

    [
      'LHS ORVM',
      [
        'OK',
        'Scratch + Faded',
        'Mirror Crack',
        'Folding Motor Not Working',
        'Light Not Working'
      ]
    ],

    [
      'LHS Front Tyre',
      [
        'OK',
        'Tyre Crack',
        'Rim Rusting',
        'Wheel Cap Missing',
        'Lug Nut Missing'
      ]
    ],

    [
      'LHS Fender',
      [
        'OK',
        'Dent',
        'Scratch',
        'Rusting',
        'Lug Missing'
      ]
    ],


    // ==================== INNER / ENGINE AREA ====================

    [
      'Firewall',
      [
        'OK',
        'Rusted',
        'Cover Damage',
        'Carpet Damage',
        'Crack & Hole',
        'Repaired / Welded'
      ]
    ]

  ]
},


    // ===================================================
    // ENGINE
    // ===================================================

    {

      key: 'engine',

      title: 'ENGINE',

      rows: [

        [
          'Engine Oil',
          [
            'OK',
            'Needs Replacement',
            'Low Level',
            'Leakage'
          ]
        ],

        [
          'Engine Mount',
          [
            'OK',
            'Weak',
            'Damaged',
            'Needs Replacement'
          ]
        ],

        [
          'Engine Noise',
          [
            'Normal',
            'Minor Noise',
            'Abnormal Noise',
            'Major Noise'
          ]
        ],

        [
          'Engine Smoke',
          [
            'No Smoke',
            'White Smoke',
            'Blue Smoke',
            'Black Smoke'
          ]
        ],

        [
          'Coolant',
          [
            'OK',
            'Low Level',
            'Leakage',
            'Needs Replacement'
          ]
        ],

        [
          'Radiator',
          [
            'OK',
            'Minor Leakage',
            'Major Leakage',
            'Damaged'
          ]
        ],

        [
          'Battery',
          [
            'Good',
            'Average',
            'Weak',
            'Needs Replacement'
          ]
        ]

      ]

    },


    // ===================================================
    // SUSPENSION + STEERING
    // ===================================================

    {

      key: 'suspension_steering',

      title: 'SUSPENSION + STEERING',

      rows: [

        [
          'Front Suspension',
          [
            'OK',
            'Minor Noise',
            'Weak',
            'Damaged'
          ]
        ],

        [
          'Rear Suspension',
          [
            'OK',
            'Minor Noise',
            'Weak',
            'Damaged'
          ]
        ],

        [
          'Steering',
          [
            'OK',
            'Minor Play',
            'Excessive Play',
            'Needs Repair'
          ]
        ],

        [
          'Steering Rack',
          [
            'OK',
            'Minor Leakage',
            'Major Leakage',
            'Damaged'
          ]
        ]

      ]

    },


    // ===================================================
    // ELECTRICAL + INTERIOR + FEATURES
    // ===================================================

    {

      key: 'electrical_interior_features',

      title:
        'ELECTRICAL + INTERIOR + FEATURES',

      rows: [

        [
          'Power Windows',
          [
            'Working',
            'Partially Working',
            'Not Working'
          ]
        ],

        [
          'Central Locking',
          [
            'Working',
            'Partially Working',
            'Not Working'
          ]
        ],

        [
          'Infotainment',
          [
            'Working',
            'Partially Working',
            'Not Working'
          ]
        ],

        [
          'Horn',
          [
            'Working',
            'Weak',
            'Not Working'
          ]
        ],

        [
          'Headlights',
          [
            'Working',
            'Weak',
            'Not Working'
          ]
        ],

        [
          'Tail Lights',
          [
            'Working',
            'Weak',
            'Not Working'
          ]
        ],

        [
          'Interior Condition',
          [
            'Excellent',
            'Good',
            'Average',
            'Poor'
          ]
        ],

        [
          'Dashboard',
          [
            'Excellent',
            'Good',
            'Average',
            'Damaged'
          ]
        ],

        [
          'Seats',
          [
            'Excellent',
            'Good',
            'Average',
            'Damaged'
          ]
        ]

      ]

    },


    // ===================================================
    // AC / ELECTRICAL
    // ===================================================

    {

      key: 'ac_electrical',

      title: 'AC / ELECTRICAL',

      rows: [

        [
          'AC Cooling',
          [
            'Excellent',
            'Good',
            'Average',
            'Not Cooling'
          ]
        ],

        [
          'AC Compressor',
          [
            'OK',
            'Noisy',
            'Weak',
            'Damaged'
          ]
        ],

        [
          'Blower',
          [
            'Working',
            'Weak',
            'Not Working'
          ]
        ],

        [
          'Defogger',
          [
            'Working',
            'Not Working'
          ]
        ],

        [
          'AC Gas',
          [
            'OK',
            'Low',
            'Needs Refill'
          ]
        ]

      ]

    },


    // ===================================================
    // TRANSMISSION
    // ===================================================

    {

      key: 'transmission',

      title: 'TRANSMISSION',

      rows: [

        [
          'Clutch',
          [
            'Excellent',
            'Good',
            'Hard',
            'Slipping',
            'Needs Replacement'
          ]
        ],

        [
          'Gear Shifting',
          [
            'Smooth',
            'Minor Hardness',
            'Hard',
            'Problematic'
          ]
        ],

        [
          'Gearbox Noise',
          [
            'Normal',
            'Minor Noise',
            'Major Noise'
          ]
        ],

        [
          'Transmission Oil',
          [
            'OK',
            'Low',
            'Dirty',
            'Leakage'
          ]
        ]

      ]

    },


    // ===================================================
    // BRAKING
    // ===================================================

    {

      key: 'braking',

      title: 'BRAKING',

      rows: [

        [
          'Front Brake',
          [
            'Excellent',
            'Good',
            'Average',
            'Needs Replacement'
          ]
        ],

        [
          'Rear Brake',
          [
            'Excellent',
            'Good',
            'Average',
            'Needs Replacement'
          ]
        ],

        [
          'Brake Disc',
          [
            'Good',
            'Worn',
            'Damaged'
          ]
        ],

        [
          'Brake Pads',
          [
            'Good',
            '50% Life',
            'Low Life',
            'Needs Replacement'
          ]
        ],

        [
          'Hand Brake',
          [
            'Working',
            'Weak',
            'Not Working'
          ]
        ]

      ]

    },


    // ===================================================
    // TYRES + WHEELS
    // ===================================================

    {

      key: 'tyres_wheels',

      title: 'TYRES + WHEELS',

      rows: [

        [
          'Front Left Tyre',
          [
            'Excellent',
            'Good',
            'Average',
            'Worn',
            'Damaged'
          ]
        ],

        [
          'Front Right Tyre',
          [
            'Excellent',
            'Good',
            'Average',
            'Worn',
            'Damaged'
          ]
        ],

        [
          'Rear Left Tyre',
          [
            'Excellent',
            'Good',
            'Average',
            'Worn',
            'Damaged'
          ]
        ],

        [
          'Rear Right Tyre',
          [
            'Excellent',
            'Good',
            'Average',
            'Worn',
            'Damaged'
          ]
        ],

        [
          'Spare Tyre',
          [
            'Available',
            'Worn',
            'Damaged',
            'Not Available'
          ]
        ],

        [
          'Wheel Alignment',
          [
            'OK',
            'Needs Alignment'
          ]
        ],

        [
          'Wheel Balancing',
          [
            'OK',
            'Needs Balancing'
          ]
        ]

      ]

    },


    // ===================================================
    // DOCUMENTS + TITLE
    // ===================================================

    {

      key: 'documents_title',

      title: 'DOCUMENTS + TITLE',

      rows: [

        [
          'RC',
          [
            'Original',
            'Duplicate',
            'Missing',
            'Smart Card'
          ]
        ],

        [
          'Insurance',
          [
            'Valid',
            'Expired',
            'Third Party',
            'Comprehensive',
            'Missing'
          ]
        ],

        [
          'PUC',
          [
            'Valid',
            'Expired',
            'Missing'
          ]
        ],

        [
          'Service History',
          [
            'Available',
            'Partial',
            'Not Available'
          ]
        ],

        [
          'Loan / Hypothecation',
          [
            'No Loan',
            'Active Loan',
            'Closed Loan'
          ]
        ]

      ]

    }

  ];



  // =====================================================
  // GET ALL VEHICLES
  // =====================================================

  getVehicles():

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/vehicles`

    );

  }


  // =====================================================
  // GET DELETED VEHICLES
  //
  // ADMIN - DELETED CARS
  // =====================================================

  getDeletedVehicles():
    Observable<any> {

    return this.http.get(
      `${this.apiUrl}/admin/vehicles/deleted`
    );

  }



  // =====================================================
  // RESTORE VEHICLE
  //
  // ADMIN - RESTORE SOFT-DELETED CAR
  // =====================================================

  restoreVehicle(
    carId: number
  ):
    Observable<any> {

    const id =
      Number(carId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new Error(
        'Valid vehicle ID is required.'
      );

    }

    return this.http.patch(
      `${this.apiUrl}/admin/vehicles/${id}/restore`,
      {}
    );

  }



  // =====================================================
  // GET PUBLISHED VEHICLES
  //
  // CUSTOMER / PUBLIC HOME PAGE
  // IMPORTANT: This does NOT use /admin/vehicles because
  // the admin endpoint is protected by JWT authentication.
  // =====================================================

  getPublishedVehicles():

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/vehicles`

    );

  }



  // =====================================================
  // ADD VEHICLE
  //
  // Existing method preserved.
  // =====================================================

  addVehicle(

    vehicle: AddVehiclePayload

  ):

    Observable<any> {

    return this.http.post(

      `${this.apiUrl}/admin/vehicles`,

      vehicle

    );

  }



  // =====================================================
  // UPLOAD VEHICLE IMAGES
  //
  // Existing functionality preserved.
  // Added row / column support for Edit Vehicle.
  // =====================================================

  uploadVehicleImages(

    carId: number,

    images: {

      type: string;

      file: File | null;

      preview: string;

      row?: string;

      column?: number;

    }[]

  ):

    Observable<any> {


    const formData =

      new FormData();


    let fileIndex =

      0;


    images.forEach(

      image => {

        if (!image.file) {

          return;

        }


        formData.append(

          'images',

          image.file

        );


        formData.append(

          `imageType_${fileIndex}`,

          image.type

        );


        // -------------------------------------------------
        // EDIT VEHICLE IMAGE ROW
        // -------------------------------------------------

        if (image.row) {

          formData.append(

            `imageRow_${fileIndex}`,

            image.row

          );

        }


        // -------------------------------------------------
        // EDIT VEHICLE IMAGE COLUMN
        // -------------------------------------------------

        if (
          image.column !== undefined
        ) {

          formData.append(

            `imageColumn_${fileIndex}`,

            String(image.column)

          );

        }


        fileIndex++;

      }

    );


    return this.http.post(

      `${this.apiUrl}/admin/vehicles/${carId}/images`,

      formData

    );

  }



  // =====================================================
  // GET SINGLE VEHICLE
  // =====================================================

  getVehicleById(

    carId: number

  ):

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/vehicles/${carId}`

    );

  }



  // =====================================================
  // UPDATE VEHICLE
  //
  // EDIT VEHICLE
  // =====================================================

  updateVehicle(

    carId: number,

    vehicle: any

  ):

    Observable<any> {

    return this.http.put(

      `${this.apiUrl}/admin/vehicles/${carId}`,

      vehicle

    );

  }



  // =====================================================
  // GET PUBLIC VEHICLE BY ID
  //
  // Used by customer/public vehicle detail.
  // =====================================================

  getPublicVehicleById(

    carId: number

  ):

    Observable<VehicleResponse> {

    return this.http.get<VehicleResponse>(

      `${this.apiUrl}/vehicles/${carId}`

    );

  }



  // =====================================================
  // GET PUBLIC VEHICLE IMAGES
  //
  // REQUIRED BY EDIT VEHICLE
  // =====================================================

  getPublicVehicleImages(

    carId: number

  ):

    Observable<any> {

    const id =
      Number(carId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new Error(
        'Valid vehicle ID is required.'
      );

    }


    return this.http.get(

      `${this.apiUrl}/admin/vehicles/${id}/images`

    );

  }



  // =====================================================
  // GET VEHICLE IMAGES
  //
  // ADMIN
  // =====================================================

  getVehicleImages(

    carId: number

  ):

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/vehicles/${carId}/images`

    );

  }



  // =====================================================
  // DELETE VEHICLE IMAGE
  // =====================================================

  deleteVehicleImage(

    imageId: number

  ):

    Observable<any> {

    return this.http.delete(

      `${this.apiUrl}/admin/vehicle-images/${imageId}`

    );

  }



  // =====================================================
  // DELETE VEHICLE
  // =====================================================

  deleteVehicle(

    carId: number

  ):

    Observable<any> {

    return this.http.delete(

      `${this.apiUrl}/admin/vehicles/${carId}`

    );

  }



  // =====================================================
  // GET ALL INSPECTION REPORTS
  // =====================================================

  getReports():

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/inspection-reports`

    );

  }



  // =====================================================
  // GET SINGLE INSPECTION REPORT
  // =====================================================

  getReportById(

    reportId: number

  ):

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/inspection-reports/${reportId}`

    );

  }



  // =====================================================
  // GENERATE ADMIN INSPECTION REPORT PDF
  //
  // Existing method preserved.
  // =====================================================

  generateInspectionReportPdf(

    reportId: number

  ):

    Observable<any> {

    return this.http.get(

      `${this.apiUrl}/admin/inspection-reports/${reportId}/pdf`

    );

  }



  // =====================================================
  // GENERATE VEHICLE INSPECTION REPORT
  //
  // Added for vehicle-based PDF generation.
  // Existing generateInspectionReportPdf() is NOT removed.
  // =====================================================

  generateVehicleInspectionReport(

    carId: number

  ):

    Observable<any> {

    const id =
      Number(carId);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new Error(

        'Valid vehicle ID is required to generate inspection PDF.'

      );

    }


    return this.http.post(

      `${this.apiUrl}/admin/vehicles/${id}/generate-inspection-report`,

      {}

    );

  }



  // =====================================================
  // SEND INSPECTION REPORT TO CUSTOMER EMAIL
  // =====================================================

  sendInspectionReportEmail(

    reportId: number,

    customerEmail: string

  ):

    Observable<any> {

    const email =
      String(
        customerEmail ||
        ''
      )
        .trim()
        .toLowerCase();

    if (!email) {

      throw new Error(
        'Customer email is required.'
      );

    }

    const id =
      Number(reportId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      throw new Error(
        'Valid inspection report ID is required.'
      );

    }

    // ---------------------------------------------------
    // IMPORTANT
    // Different backend versions may read the recipient
    // from a different property name. Send all supported
    // aliases with the same email value. Unknown JSON
    // properties are harmless and this keeps the frontend
    // compatible with the existing backend controller.
    // ---------------------------------------------------

    const payload = {

      customerEmail: email,

      recipientEmail: email,

      email: email,

      to: email

    };

    console.log(
      'SEND INSPECTION REPORT EMAIL REQUEST:',
      {
        reportId: id,
        payload
      }
    );

    return this.http.post(

      `${this.apiUrl}/admin/inspection-reports/${id}/send-email`,

      payload

    );

  }



  // =====================================================
  // SEND PDF TO CUSTOMER
  // Alias method
  // =====================================================

  sendCustomerPdf(

    reportId: number,

    customerEmail: string

  ):

    Observable<any> {

    return this.sendInspectionReportEmail(

      reportId,

      customerEmail

    );

  }



  // =====================================================
  // PUBLISH VEHICLE
  // =====================================================

  publishVehicle(

    carId: number

  ):

    Observable<any> {

    return this.http.patch(

      `${this.apiUrl}/admin/vehicles/${carId}/publish`,

      {}

    );

  }



  // =====================================================
  // UNPUBLISH VEHICLE
  // =====================================================

  unpublishVehicle(

    carId: number

  ):

    Observable<any> {

    return this.http.put(

      `${this.apiUrl}/admin/vehicles/${carId}/unpublish`,

      {}

    );

  }

}