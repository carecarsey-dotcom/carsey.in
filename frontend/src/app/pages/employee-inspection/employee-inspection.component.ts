import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  EmployeeService
} from '../../services/employee.service';

import {
  VehicleService,
  InspectionSection
} from '../../services/vehicle.service';


// ======================================================
// CHECKLIST ITEM
// ======================================================

interface ChecklistItem {
  key: string;
  title: string;
  description: string;
  status: 'Good' | 'Need Attention' | 'Issue';
  remark: string;
  file: File | null;
  preview: string;
}


// ======================================================
// VEHICLE PHOTO
// ======================================================

interface VehiclePhoto {
  key: string;
  title: string;
  file: File | null;
  preview: string;
}


// ======================================================
// DETAILED ROW IMAGE
// ======================================================

interface DetailedRowImage {
  file: File | null;
  preview: string;
}

interface InspectionVideo {
  key: 'engine_video' | 'engine_blow_by_video' | 'test_drive_video';
  title: string;
  file: File | null;
  preview: string;
  processing: boolean;
}

interface TestDrivePhoto {
  key: 'test_drive_photo_1' | 'test_drive_photo_2';
  title: string;
  file: File | null;
  preview: string;
}

interface DocumentPhoto {
  key: 'rc' | 'insurance' | 'puc' | 'service_history' | 'duplicate_key' | 'registration_details';
  title: string;
  file: File | null;
  preview: string;
}


// ======================================================
// INSPECTION REQUEST
// ======================================================

interface InspectionRequest {
  request_id: number;
  booking_id: number;
  employee_id: number;
  report_id?: number | null;

  status: string;

  employee_remark?: string | null;
  admin_remark?: string | null;

  assigned_at?: string | null;
  accepted_at?: string | null;
  started_at?: string | null;
  submitted_at?: string | null;

  name?: string;
  mobile?: string;
  email?: string;
  city?: string;
  vehicle_number?: string;
  brand?: string;
  model?: string;
  address?: string;
  booking_date?: string;
  time_slot?: string;
}


// ======================================================
// LOCAL INSPECTION DRAFT
// IndexedDB keeps form data and uploaded media safe
// across refresh, tab close and navigation.
// ======================================================

interface StoredDraftFile {
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
}

interface InspectionDraft {
  requestId: number;
  savedAt: number;
  vehicle: any;
  customer_name: string;
  owner_mobile: string;
  owner_email: string;
  owner_address: string;
  owner_city: string;
  engine_remark: string;
  overall_remark: string;
  employee_remark: string;
  overall_score: number | null;
  transmission_rating: number;
  detailedInspection: Record<string, Record<string, string[]>>;
  detailedRowRemarks: Record<string, string>;
  checklistItems: Array<{ key: string; status: 'Good' | 'Need Attention' | 'Issue'; remark: string; file: StoredDraftFile | null; }>;
  vehiclePhotos: Array<{ key: string; file: StoredDraftFile | null; }>;
  additionalVehiclePhotos: Array<{ key: string; title: string; file: StoredDraftFile | null; }>;
  documentPhotos: Array<{ key: string; file: StoredDraftFile | null; }>;
  detailedRowImages: Record<string, StoredDraftFile | null>;
  inspectionVideos: Array<{ key: string; file: StoredDraftFile | null; }>;
  testDrivePhotos: Array<{ key: string; file: StoredDraftFile | null; }>;
  testDriveVideo: StoredDraftFile | null;
}


// ======================================================
// COMPONENT
// ======================================================

@Component({
  selector: 'app-employee-inspection',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './employee-inspection.component.html'
})
export class EmployeeInspectionComponent
  implements OnInit, OnDestroy {

  // ======================================================
  // REQUEST
  // ======================================================

  requestId = 0;

  request: InspectionRequest | null = null;


  // ======================================================
  // LOADING
  // ======================================================

  loading = false;

  submitting = false;

  errorMessage = '';

  // Template validation state.
  // Kept as a Set because the HTML clears individual validation keys
  // while the inspection form is being edited.
  validationErrors = new Set<string>();

  // Inline validation state: errors are shown on the exact field/row.
  invalidVehicleFields = new Set<string>();
  invalidDetailedRows = new Set<string>();
  invalidVehiclePhotos = new Set<string>();
  invalidInspectionVideos = new Set<string>();
  invalidOverallScore = false;
  validationErrorActive = false;

  successMessage = '';

  // ======================================================
  // AUTO SAVE / LOCAL DRAFT
  // ======================================================

  private readonly DRAFT_DB_NAME = 'carseyInspectionDrafts';
  private readonly DRAFT_STORE_NAME = 'drafts';
  private readonly DRAFT_DB_VERSION = 1;
  private draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
  draftSaving = false;
  draftRestored = false;
  draftSavedAt = '';
  private inspectionSubmitted = false;


  // ======================================================
  // VEHICLE
  // ======================================================

  vehicle = {

    brand: '',

    model: '',

    variant: '',

    manufacturing_year:
      new Date().getFullYear(),

    odometer:
      null as number | null,

    city: '',

    transmission: 'Manual',

    fuel_type: 'Petrol',

    owner_classification: 'First',

    registration_number: '',

    chassis_number: '',

    engine_number: '',

    inspection_date: '',

    spare_key: 'Yes',

    insurance_type: '',

    insurance_validity: '',

    status: 'Draft'

  };


  // ======================================================
  // CUSTOMER
  // ======================================================

  customer_name = '';

  owner_mobile = '';

  owner_email = '';

  owner_address = '';

  owner_city = '';


  // ======================================================
  // INSPECTION SUMMARY
  // ======================================================

  engine_remark = '';

  overall_remark = '';

  employee_remark = '';


  // ======================================================
  // OVERALL SCORE
  // 1 - 10
  // ======================================================

  overall_score:
    number | null = null;

  // Transmission star rating (1-5)
  transmission_rating: number = 0;


  // ======================================================
  // DETAILED INSPECTION
  // ======================================================

  inspectionSections: InspectionSection[] = [
    {
      key: 'documents_title',
      title: 'DOCUMENTS + TITLE',
      rows: [
        ['Documents / Title', ['Ok/No imperfection','RC Available','PUC Available','Insurance Available','Chassis Number Mismatch']],
      ]
    },
    {
  key: 'exterior',

  title: 'EXTERIOR + TYRE',

  rows: [

    // ==================== FRONT SIDE ====================

    ['Front Bumper', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],

    ['Bonnet / Hood', [
      'Ok/No imperfection',
      'Dent',
      'Scratch',
      'Rusting',
      'Scooper Not Working',
      'Crack / Hole'
    ]],

    ['Front Windshield', [
      'Ok/No imperfection',
      'Glass Crack',
      'Glass Chip',
      'Scratch',
      'Rubber Damage',
      'Water Leakage'
    ]],

    ['Roof', [
      'Ok/No imperfection',
      'Paint Mismatch + Faded',
      'Dent',
      'Crack / Hole',
      'Scratches',
      'Roof Rail Broken',
      'Sun Roof Not Working'
    ]],

    // ==================== RIGHT SIDE ====================

    ['Fender RHS', [
      'Ok/No imperfection',
      'Dent',
      'Scratch',
      'Rusting',
      'Lug Missing'
    ]],

    ['Tyre Front RHS', [
      'Ok/No imperfection',
      'Tyre Crack',
      'Rim Rusting',
      'Wheel Cap Missing',
      'Lug Nut Missing'
    ]],

    ['Door Front RHS', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],

    ['ORVM RHS', [
      'Ok/No imperfection',
      'Scratch + Faded',
      'Mirror Crack',
      'Folding Motor Not Working',
      'Light Not Working'
    ]],

    ['Pillar A - RHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Pillar B - RHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Pillar C - RHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Door Rear RHS', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],

    ['Running Board RHS', [
      'Ok/No imperfection',
      'Scratches',
      'Dent',
      'Rusted',
      'Cladding Broken / Not Fixed Properly',
      'Paint Mismatch / Hole / Crack'
    ]],

    ['Tyre Rear RHS', [
      'Ok/No imperfection',
      'Tyre Crack',
      'Rim Rusting',
      'Wheel Cap Missing',
      'Lug Nut Missing'
    ]],

    ['Quarter Panel RHS', [
      'Ok/No imperfection',
      'Fuel Lid Lock Not Working',
      'Paint Issue + Mismatch + Faded',
      'Dent',
      'Rusting',
      'Scratches',
      'Repair + Repaint + Welded'
    ]],


    // ==================== REAR SIDE ====================

    ['Dicky / Boot Door', [
      'Ok/No imperfection',
      'Scratches',
      'Dent',
      'Rusted',
      'Boot Partial Missing',
      'Jack & Tools Missing',
      'Shocker Not Working',
      'Dicky Lock Not Working',
      'Spoiler Broken / Damage'
    ]],

    ['Rear Windshield', [
      'Ok/No imperfection',
      'Glass Crack',
      'Glass Chip',
      'Scratch',
      'Rubber Damage',
      'Water Leakage'
    ]],

    ['Spare Tyre', [
      'Ok/No imperfection',
      'Tyre Crack',
      'Rim Rusting',
      'Wheel Cap Missing',
      'Lug Nut Missing'
    ]],

    ['Boot Floor', [
      'Ok/No imperfection',
      'Water Logging',
      'Welded / Repaired',
      'Rusting',
      'Dent',
      'Hole & Crack'
    ]],

    ['Rear Bumper', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],


    // ==================== LEFT SIDE ====================

    ['Quarter Panel LHS', [
      'Ok/No imperfection',
      'Fuel Lid Lock Not Working',
      'Paint Issue + Mismatch + Faded',
      'Dent',
      'Rusting',
      'Scratches',
      'Repair + Repaint + Welded'
    ]],

    ['Tyre Rear LHS', [
      'Ok/No imperfection',
      'Tyre Crack',
      'Rim Rusting',
      'Wheel Cap Missing',
      'Lug Nut Missing'
    ]],

    ['Running Board LHS', [
      'Ok/No imperfection',
      'Scratches',
      'Dent',
      'Rusted',
      'Cladding Broken / Not Fixed Properly',
      'Paint Mismatch / Hole / Crack'
    ]],

    ['Door Rear LHS', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],

    ['Pillar C - LHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Pillar B - LHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Pillar A - LHS', [
      'Ok/No imperfection',
      'Paint Faded / Mismatch',
      'Scratches',
      'Dent',
      'Rusting',
      'Repaired + Welded'
    ]],

    ['Door Front LHS', [
      'Ok/No imperfection',
      'Broken/Crack',
      'Dented',
      'Rusted',
      'Scratch',
      'Paint Mismatch',
      'Repair + Repaint'
    ]],

    ['ORVM LHS', [
      'Ok/No imperfection',
      'Scratch + Faded',
      'Mirror Crack',
      'Folding Motor Not Working',
      'Light Not Working'
    ]],

    ['Tyre Front LHS', [
      'Ok/No imperfection',
      'Tyre Crack',
      'Rim Rusting',
      'Wheel Cap Missing',
      'Lug Nut Missing'
    ]],

    ['Fender LHS', [
      'Ok/No imperfection',
      'Dent',
      'Scratch',
      'Rusting',
      'Lug Missing'
    ]],

    ['Tyres / Wheels Overall', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],

  ]
},
    {
      key: 'engine_bay',
      title: 'ENGINE + TRANSMISSION',
      rows: [
        ['Upper Cross Member', [
          'Ok/No imperfection',
          'Rusting',
          'Damage',
          'Repaired / Welded'
        ]],
        ['Apron RHS', [
          'Ok/No imperfection',
          'Repaired / Welded',
          'Repainted',
          'Rusting',
          'Dent',
          'Crack / Hole'
        ]],
        ['Apron LHS', [
          'Ok/No imperfection',
          'Repaired / Welded',
          'Repainted',
          'Rusting',
          'Dent',
          'Crack / Hole'
        ]],
        ['Firewall', [
          'Ok/No imperfection',
          'Rusted',
          'Cover Damage',
          'Carpet Damage',
          'Crack & Hole',
          'Repaired / Welded'
        ]],
        ['Engine Oil', ['Ok/No imperfection','Level Low','Dirty','Replace Oil']],
        ['Cooling System', ['Ok/No imperfection','Mixed With Oil','Bottle Broken + Leakage','Coolant Dirty']],
        ['Engine', ['Ok/No imperfection','Leakage From Seal','Tappet Cover Loose','Engine Misfiring','Dipstick Missing / Broken','Exhaust Smoke','Air Filter Box Damage','RPM Fluctuate','Fuse Box Cover Missing']],
        ['UnderBody', ['Ok/No imperfection','Rusted','Repaired + Welded']],
        ['Engine Blow By', ['Ok/No imperfection','Engine Permissible Low Blow By','Engine Blow By / Back Compressor']],
        ['Transmission', ['Ok/No imperfection','Low Pickup','Clutch Noise','Bearing Damage','Spongy Clutch']],
        ['Gear Shifting / Gear Box Mount', ['Ok/No imperfection','Hard','Bearing Damage','Broken','Gear Box Mount Damage']],
        ['Turbocharger', ['Ok/No imperfection','Not Applicable','Housing Worn Out','Not Working','Oil Leakage','Bearing Damage']],
        ['Battery', ['Ok/No imperfection','Battery Terminal Broken','Acid Leakage','Dead / Not Restart']],
        ['Alternator', ['Ok/No imperfection','Not Charging','Bearing Damage','Belt Damage']],
        ['Engine Assembly', ['Ok/No imperfection','Engine Mount Broken','Leakage From Exhaust Pipe','Starter Motor Noise']],
        ['Radiator Support', ['Ok/No imperfection','Leakage','Support Broken','Radiator Cap Missing','Support Welding','Support Rusted','Damage / Breakage']],
        ['Axle', ['Ok/No imperfection','Boot Damage','Boot Leakage','Broken']],
        ['4WD / AWD', ['Ok/No imperfection','Not Applicable','Leakage','Switch Not Working']],
      ]
    },
    {
      key: 'suspension_steering',
      title: 'STEERING + SUSPENSION + BRAKE',
      rows: [
        ['Suspension', ['Ok/No imperfection','Lower + Upper Arm Noise','Major Leakage Noise','Boot Damage','Strut Noise','Shocker Mount Noise']],
        ['Steering', ['Ok/No imperfection','Rack Boot Damage','Steering Pump Hard','Power Steering Oil Dirty','Steering Rack Noise']],
        ['Brake Master Cylinder', ['Ok/No imperfection','Leakage','Hard Brake','Spongy Brake']],
      ]
    },
    {
      key: 'interior_electricals',
      title: 'ELECTRICAL + INTERIOR + FEATURES',
      rows: [
        ['Cabinette Switch', ['Ok/No imperfection','Switch Broken','Not Working']],
        ['Dashboard', ['Ok/No imperfection','Faded','Glove Box Cover Damage','Broken','Bonnet Lever Not Working','Scratches']],
        ['Flooring', ['Ok/No imperfection','Water On Floor','Floor Rusting','Mat Missing','Crack & Hole']],
        ['Ceiling', ['Ok/No imperfection','Sun Visor Missing + Damage','Roof Handle Missing + Broken','Rear View Mirror Broken']],
        ['Lock System', ['Ok/No imperfection','Remote Key Not Working + Broken','Door Lock Knob Broken / Missing','Keyless Sensor Not Working','Mechanical Key Damage','Push Start Not Working']],
        ['Steering Handle', ['Ok/No imperfection','Horn Not Working','Steering Handle Faded','Steering System Control Not Working']],
        ['Gear Lever', ['Ok/No imperfection','Boot Cover Torn','Knob Torn','Knob Broken']],
        ['Infotainment System', ['Ok/No imperfection','Not Applicable','Music System Crack','Speaker Not Working / Broken']],
        ['Instrument Cluster', ['Ok/No imperfection','Odometer Not Working','Glass Scratch / Minor / Major Deep','Speedometer Not Working','Tachometer Not Working','Air Bag Deployed','Air Bag Warning Light Glowing','Fuel Low','EPS','Air Suspension','Alternator + Battery','Air Bag','ABS','Transmission Warning','Oil Pressure Low','Engine Warning','Cruise Control','Non-Critical Warning Light','Trip Meter','Idle Start / Stop Not Working']],
        ['Brake Overall', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out','Hard Brake','Spongy Brake']],
      ]
    },
    {
      key: 'all_side_window',
      title: 'ALL SIDE WINDOW',
      rows: [
        ['All Window Switch', ['Ok/No imperfection','Not Working','Power Window Noise','Switch Damage','Broken']],
        ['Front RHS', ['Ok/No imperfection','Glass Crack','Glass Scratch','Window Not Working','Window Noise']],
        ['Front LHS', ['Ok/No imperfection','Glass Crack','Glass Scratch','Window Not Working','Window Noise']],
        ['Rear RHS', ['Ok/No imperfection','Glass Crack','Glass Scratch','Window Not Working','Window Noise']],
        ['Rear LHS', ['Ok/No imperfection','Glass Crack','Glass Scratch','Window Not Working','Window Noise']],
      ]
    },
    {
      key: 'all_seats',
      title: 'ALL SEATS',
      rows: [
        ['Seat 1st Row RHS', ['Ok/No imperfection','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Seat 1st Row LHS', ['Ok/No imperfection','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Seat 2nd Row RHS', ['Ok/No imperfection','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Seat 2nd Row LHS', ['Ok/No imperfection','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Seat 3rd Row RHS', ['Ok/No imperfection','Not Applicable','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Seat 3rd Row LHS', ['Ok/No imperfection','Not Applicable','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
      ]
    },
    {
      key: 'electricals_ac',
      title: 'AC + LIGHT',
      rows: [
        ['Head Light RHS', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Head Light LHS', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Fog Light RHS', ['Ok/No imperfection','Not Applicable','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Fog Light LHS', ['Ok/No imperfection','Not Applicable','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Tail Light RHS', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Tail Light LHS', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['AC Unit', ['Ok/No imperfection','AC Cooling Not Working','AC Vent Not Fixed / Broken','Blower Motor Not Working','Noise','Heater Ineffective','AC Not Cooling','Cooling Fan Noise']],
      ]
    },
    {
      key: 'transmission_system',
      title: 'TRANSMISSION',
      rows: [
        ['Transmission Overall', ['Ok/No imperfection','Low Pickup','Clutch Noise','Bearing Damage','Spongy Clutch','Gear Shifting Hard']],
      ]
    },
  ];

  detailedInspection:
    Record<
      string,
      Record<string, string[]>
    > = {};

  detailedRowRemarks:
    Record<string, string> = {};

  detailedRowImages:
    Record<string, DetailedRowImage> = {};

  openInspectionSections:
    Record<string, boolean> = {};


  // ======================================================
  // CAMERA
  // ======================================================

  cameraOpen = false;

  cameraStream:
    MediaStream | null = null;

  cameraVideo:
    HTMLVideoElement | null = null;

  cameraTarget:
    {
      mode: 'detailed';
      sectionKey: string;
      rowName: string;
    } |
    {
      mode: 'vehicle';
      key: string;
    } |
    {
      mode: 'test_drive';
      key: TestDrivePhoto['key'];
    } |
    {
      mode: 'document';
      key: DocumentPhoto['key'];
    } | null = null;

  videoCameraOpen = false;
  videoCameraStream: MediaStream | null = null;
  videoCameraVideo: HTMLVideoElement | null = null;
  videoCameraTarget: InspectionVideo['key'] | 'test_drive_video' | null = null;
  videoRecorder: MediaRecorder | null = null;
  videoRecorderChunks: Blob[] = [];
  videoRecording = false;


  // ======================================================
  // CHECKLIST
  //
  // EXISTING CHECKLIST PRESERVED
  // ======================================================

  checklistItems: ChecklistItem[] = [

    {
      key: 'exterior_body',

      title: 'Exterior Body',

      description:
        'Panel, paint and body condition',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'tyres',

      title: 'Tyres',

      description:
        'Tread, condition and wear',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'engine',

      title: 'Engine',

      description:
        'Engine sound, leakage and mounting',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'transmission',

      title: 'Transmission',

      description:
        'Clutch, gear shifting and smoothness',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'steering',

      title: 'Steering',

      description:
        'Steering play and alignment',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'suspension',

      title: 'Suspension',

      description:
        'Shock, bush and suspension condition',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'brakes',

      title: 'Brakes',

      description:
        'Front and rear brake condition',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'electrical',

      title: 'Electrical',

      description:
        'Lights, indicators and horn',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'ac_heater',

      title: 'AC / Heater',

      description:
        'Cooling and blower condition',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'interior',

      title: 'Interior',

      description:
        'Seats, upholstery and cleanliness',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'dashboard',

      title: 'Dashboard',

      description:
        'Meters and warning lights',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    },

    {
      key: 'documents',

      title: 'Documents + Title',

      description:
        'RC, Insurance, PUC and documents',

      status: 'Good',

      remark: '',

      file: null,

      preview: ''
    }

  ];


  // ======================================================
  // VEHICLE PHOTOS
  // EXACTLY 6 OPTIONS
  // ======================================================

  vehiclePhotos: VehiclePhoto[] = [
    { key: 'front_view', title: 'Front View', file: null, preview: '' },
    { key: 'right_side', title: 'Right View', file: null, preview: '' },
    { key: 'rear_view', title: 'Rear View', file: null, preview: '' },
    { key: 'left_side', title: 'Left View', file: null, preview: '' },
    { key: 'interior', title: 'Interior Seat Rear', file: null, preview: '' },
    { key: 'seat', title: 'Interior Front Seat', file: null, preview: '' },
    { key: 'engine', title: 'Open Engine', file: null, preview: '' },
    { key: 'dicky', title: 'Open Dicky', file: null, preview: '' },
    { key: 'odometer', title: 'Odometer', file: null, preview: '' },
    { key: 'dashboard', title: 'Dashboard', file: null, preview: '' }
  ];

  // ======================================================
  // ADDITIONAL VEHICLE PHOTOS
  // OPTIONAL - MAXIMUM 6 PHOTOS
  // ======================================================

  additionalVehiclePhotos: VehiclePhoto[] = [];

  readonly maxAdditionalVehiclePhotos = 6;

  // ======================================================
  // INSPECTION VIDEOS
  // ======================================================

  inspectionVideos: InspectionVideo[] = [
    { key: 'engine_video', title: 'Engine Video', file: null, preview: '', processing: false },
    { key: 'engine_blow_by_video', title: 'Engine Blow By Video', file: null, preview: '', processing: false }
  ];

  // ======================================================
  // TEST DRIVE MEDIA
  // ======================================================

  testDrivePhotos: TestDrivePhoto[] = [
    { key: 'test_drive_photo_1', title: 'Test Drive Photo 1', file: null, preview: '' },
    { key: 'test_drive_photo_2', title: 'Test Drive Photo 2', file: null, preview: '' }
  ];

  documentPhotos: DocumentPhoto[] = [
    { key: 'rc', title: 'RC', file: null, preview: '' },
    { key: 'insurance', title: 'Insurance', file: null, preview: '' },
    { key: 'puc', title: 'PUC', file: null, preview: '' },
    { key: 'service_history', title: 'Service History', file: null, preview: '' },
    { key: 'duplicate_key', title: 'Duplicate Key', file: null, preview: '' },
    { key: 'registration_details', title: 'Registration Details', file: null, preview: '' }
  ];

  testDriveVideo: InspectionVideo = {
    key: 'engine_video',
    title: 'Test Drive Video',
    file: null,
    preview: '',
    processing: false
  };

  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    private employeeService: EmployeeService,

    private route: ActivatedRoute,

    private router: Router,

    private vehicleService: VehicleService
  ) {

    this.initializeDetailedInspection();
  }


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get(
          'requestId'
        )
      );

    if (
      !id ||
      Number.isNaN(id)
    ) {

      this.errorMessage =
        'Invalid inspection request.';

      return;
    }

    this.requestId = id;

    this.initializeDetailedInspection();

    this.loadRequest();
  }


  // ======================================================
  // LOAD REQUEST
  // ======================================================

  loadRequest(): void {

    this.loading = true;

    this.errorMessage = '';

    this.employeeService
      .getRequestById(this.requestId)
      .subscribe({

        next: (response: any) => {

          this.loading = false;

          const data =
            response?.data ||
            response?.request ||
            response;

          if (!data) {

            this.errorMessage =
              'Inspection request not found.';

            return;
          }

          this.request = data;

          this.prefillRequestData();
          void this.restoreInspectionDraft();
        },

        error: (error: any) => {

          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to load inspection request.';
        }

      });
  }


  // ======================================================
  // PREFILL ONLY BOOKING DATA
  //
  // OLD INSPECTION DATA WILL NOT BE LOADED
  // ======================================================

  private prefillRequestData(): void {

    if (!this.request) {
      return;
    }

    // ----------------------------------------------------
    // CUSTOMER
    // ----------------------------------------------------

    this.customer_name =
      this.request.name || '';

    this.owner_mobile =
      this.request.mobile || '';

    this.owner_email =
      this.request.email || '';

    this.owner_address =
      this.request.address || '';

    this.owner_city =
      this.request.city || '';


    // ----------------------------------------------------
    // VEHICLE
    // ----------------------------------------------------

    this.vehicle.brand =
      this.request.brand || '';

    this.vehicle.model =
      this.request.model || '';

    this.vehicle.registration_number =
      this.request.vehicle_number || '';

    this.vehicle.city =
      this.request.city || '';


    // ----------------------------------------------------
    // BOOKING DATE
    // ----------------------------------------------------

    this.vehicle.inspection_date =
      this.formatDateForInput(
        this.request.booking_date || ''
      );
  }


  // ======================================================
  // INDEXED DB DRAFT HELPERS
  // ======================================================

  private openDraftDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported by this browser.'));
        return;
      }

      const request = window.indexedDB.open(
        this.DRAFT_DB_NAME,
        this.DRAFT_DB_VERSION
      );

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.DRAFT_STORE_NAME)) {
          db.createObjectStore(this.DRAFT_STORE_NAME, { keyPath: 'requestId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(
        request.error || new Error('Unable to open draft database.')
      );
    });
  }

  private fileToStoredFile(file: File | null): StoredDraftFile | null {
    if (!file) return null;
    return {
      name: file.name,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified || Date.now(),
      blob: file
    };
  }

  private storedFileToFile(stored: StoredDraftFile | null): File | null {
    if (!stored?.blob) return null;
    return new File(
      [stored.blob],
      stored.name || 'inspection-file',
      {
        type: stored.type || stored.blob.type || 'application/octet-stream',
        lastModified: stored.lastModified || Date.now()
      }
    );
  }

  private async saveInspectionDraft(): Promise<void> {
    if (!this.requestId || this.inspectionSubmitted) return;

    try {
      this.draftSaving = true;

      const draft: InspectionDraft = {
        requestId: this.requestId,
        savedAt: Date.now(),
        vehicle: { ...this.vehicle },
        customer_name: this.customer_name,
        owner_mobile: this.owner_mobile,
        owner_email: this.owner_email,
        owner_address: this.owner_address,
        owner_city: this.owner_city,
        engine_remark: this.engine_remark,
        overall_remark: this.overall_remark,
        employee_remark: this.employee_remark,
        overall_score: this.overall_score,
        transmission_rating: this.transmission_rating,
        detailedInspection: JSON.parse(JSON.stringify(this.detailedInspection)),
        detailedRowRemarks: JSON.parse(JSON.stringify(this.detailedRowRemarks)),
        checklistItems: this.checklistItems.map(item => ({
          key: item.key,
          status: item.status,
          remark: item.remark || '',
          file: this.fileToStoredFile(item.file)
        })),
        vehiclePhotos: this.vehiclePhotos.map(photo => ({
          key: photo.key,
          file: this.fileToStoredFile(photo.file)
        })),
        additionalVehiclePhotos: this.additionalVehiclePhotos.map(photo => ({
          key: photo.key,
          title: photo.title,
          file: this.fileToStoredFile(photo.file)
        })),
        documentPhotos: this.documentPhotos.map(photo => ({
          key: photo.key,
          file: this.fileToStoredFile(photo.file)
        })),
        detailedRowImages: Object.fromEntries(
          Object.entries(this.detailedRowImages).map(([key, image]) => [
            key,
            this.fileToStoredFile(image?.file || null)
          ])
        ),
        inspectionVideos: this.inspectionVideos.map(video => ({
          key: video.key,
          file: this.fileToStoredFile(video.file)
        })),
        testDrivePhotos: this.testDrivePhotos.map(photo => ({
          key: photo.key,
          file: this.fileToStoredFile(photo.file)
        })),
        testDriveVideo: this.fileToStoredFile(this.testDriveVideo.file)
      };

      const db = await this.openDraftDB();

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.DRAFT_STORE_NAME, 'readwrite');
        transaction.objectStore(this.DRAFT_STORE_NAME).put(draft);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(
          transaction.error || new Error('Unable to save inspection draft.')
        );
        transaction.onabort = () => reject(
          transaction.error || new Error('Inspection draft save aborted.')
        );
      });

      db.close();

      this.draftSavedAt = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Inspection draft save failed:', error);
    } finally {
      this.draftSaving = false;
    }
  }

  scheduleDraftSave(): void {
    if (!this.requestId || this.inspectionSubmitted) return;

    if (this.draftSaveTimer) clearTimeout(this.draftSaveTimer);

    this.draftSaveTimer = setTimeout(() => {
      this.draftSaveTimer = null;
      void this.saveInspectionDraft();
    }, 500);
  }

  private async restoreInspectionDraft(): Promise<void> {
    if (!this.requestId || this.draftRestored) return;

    try {
      const db = await this.openDraftDB();

      const draft = await new Promise<InspectionDraft | null>((resolve, reject) => {
        const transaction = db.transaction(this.DRAFT_STORE_NAME, 'readonly');
        const request = transaction.objectStore(this.DRAFT_STORE_NAME).get(this.requestId);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(
          request.error || new Error('Unable to read inspection draft.')
        );
      });

      db.close();
      if (!draft) return;

      this.vehicle = { ...this.vehicle, ...draft.vehicle };
      this.customer_name = draft.customer_name || '';
      this.owner_mobile = draft.owner_mobile || '';
      this.owner_email = draft.owner_email || '';
      this.owner_address = draft.owner_address || '';
      this.owner_city = draft.owner_city || '';
      this.engine_remark = draft.engine_remark || '';
      this.overall_remark = draft.overall_remark || '';
      this.employee_remark = draft.employee_remark || '';
      this.overall_score = draft.overall_score;
      this.transmission_rating = draft.transmission_rating || 0;

      if (draft.detailedInspection) {
        this.detailedInspection = JSON.parse(JSON.stringify(draft.detailedInspection));
      }

      // ----------------------------------------------------
      // MIGRATE OLD CHECKLIST ROW NAMES / LOCATIONS
      // Keeps existing local drafts usable after the checklist
      // structure changes. No saved draft data is intentionally removed.
      // ----------------------------------------------------
      const oldExterior = this.detailedInspection['exterior'] || {};
      const engineBay = this.detailedInspection['engine_bay'] || {};
      const oldInterior = this.detailedInspection['interior_electricals'] || {};
      const oldAllSideWindow = this.detailedInspection['all_side_window'] || {};
      const oldLights = this.detailedInspection['lights_separate'] || {};
      const oldTyres = this.detailedInspection['tires_wheels'] || {};
      const oldBrakes = this.detailedInspection['braking_system'] || {};
      const newElectricalAc = this.detailedInspection['electricals_ac'] || {};

      // Preserve old saved draft data when checklist rows are moved.
      for (const oldRow of ['Apron RHS', 'Apron LHS', 'Firewall', 'Upper Cross Member']) {
        if (
          oldExterior[oldRow] &&
          oldExterior[oldRow].length > 0 &&
          (!engineBay[oldRow] || engineBay[oldRow].length === 0)
        ) {
          engineBay[oldRow] = [...oldExterior[oldRow]];
        }
        delete oldExterior[oldRow];
      }

      if (oldTyres['Tyres / Wheels Overall'] && !oldExterior['Tyres / Wheels Overall']) {
        oldExterior['Tyres / Wheels Overall'] = [...oldTyres['Tyres / Wheels Overall']];
      }

      if (oldBrakes['Brake Overall'] && !oldInterior['Brake Overall']) {
        oldInterior['Brake Overall'] = [...oldBrakes['Brake Overall']];
      }

      if (oldInterior['All Window Switch'] && !oldAllSideWindow['All Window Switch']) {
        oldAllSideWindow['All Window Switch'] = [...oldInterior['All Window Switch']];
      }

      for (const rowName of ['Head Light RHS', 'Head Light LHS', 'Fog Light RHS', 'Fog Light LHS', 'Tail Light RHS', 'Tail Light LHS']) {
        if (oldLights[rowName] && !newElectricalAc[rowName]) {
          newElectricalAc[rowName] = [...oldLights[rowName]];
        }
      }

      for (const oldRow of ['1st Row RHS', '1st Row LHS', '2nd Row RHS', '2nd Row LHS', '3rd Row Seat']) {
        const oldSeats = this.detailedInspection['all_seats'] || {};
        if (oldSeats[oldRow] && oldSeats[oldRow].length > 0) {
          const newRow =
            oldRow === '1st Row RHS' ? 'Seat 1st Row RHS' :
            oldRow === '1st Row LHS' ? 'Seat 1st Row LHS' :
            oldRow === '2nd Row RHS' ? 'Seat 2nd Row RHS' :
            oldRow === '2nd Row LHS' ? 'Seat 2nd Row LHS' :
            'Seat 3rd Row RHS';

          if (!oldSeats[newRow] || oldSeats[newRow].length === 0) {
            oldSeats[newRow] = [...oldSeats[oldRow]];
          }
          delete oldSeats[oldRow];
        }
      }

      if (draft.detailedRowRemarks) {
        this.detailedRowRemarks = JSON.parse(JSON.stringify(draft.detailedRowRemarks));
      }

      for (const savedItem of draft.checklistItems || []) {
        const item = this.checklistItems.find(current => current.key === savedItem.key);
        if (!item) continue;
        item.status = savedItem.status;
        item.remark = savedItem.remark || '';
        if (item.preview) URL.revokeObjectURL(item.preview);
        item.file = this.storedFileToFile(savedItem.file);
        item.preview = item.file ? URL.createObjectURL(item.file) : '';
      }

      for (const savedPhoto of draft.vehiclePhotos || []) {
        const photo = this.vehiclePhotos.find(current => current.key === savedPhoto.key);
        if (!photo) continue;
        if (photo.preview) URL.revokeObjectURL(photo.preview);
        photo.file = this.storedFileToFile(savedPhoto.file);
        photo.preview = photo.file ? URL.createObjectURL(photo.file) : '';
      }

      // Restore optional additional vehicle photos.
      this.additionalVehiclePhotos = [];

      for (const savedPhoto of draft.additionalVehiclePhotos || []) {
        if (this.additionalVehiclePhotos.length >= this.maxAdditionalVehiclePhotos) {
          break;
        }

        const photo: VehiclePhoto = {
          key: savedPhoto.key,
          title: savedPhoto.title || `Additional Photo ${this.additionalVehiclePhotos.length + 1}`,
          file: this.storedFileToFile(savedPhoto.file),
          preview: ''
        };

        photo.preview = photo.file ? URL.createObjectURL(photo.file) : '';
        this.additionalVehiclePhotos.push(photo);
      }

      for (const savedPhoto of draft.documentPhotos || []) {
        const photo = this.documentPhotos.find(current => current.key === savedPhoto.key);
        if (!photo) continue;
        if (photo.preview) URL.revokeObjectURL(photo.preview);
        photo.file = this.storedFileToFile(savedPhoto.file);
        photo.preview = photo.file ? URL.createObjectURL(photo.file) : '';
      }

      for (const [key, savedFile] of Object.entries(draft.detailedRowImages || {})) {
        const current = this.detailedRowImages[key];
        if (!current) continue;
        if (current.preview) URL.revokeObjectURL(current.preview);
        current.file = this.storedFileToFile(savedFile);
        current.preview = current.file ? URL.createObjectURL(current.file) : '';
      }

      for (const savedVideo of draft.inspectionVideos || []) {
        const video = this.inspectionVideos.find(current => current.key === savedVideo.key);
        if (!video) continue;
        if (video.preview) URL.revokeObjectURL(video.preview);
        video.file = this.storedFileToFile(savedVideo.file);
        video.preview = video.file ? URL.createObjectURL(video.file) : '';
        video.processing = false;
      }

      for (const savedPhoto of draft.testDrivePhotos || []) {
        const photo = this.testDrivePhotos.find(current => current.key === savedPhoto.key);
        if (!photo) continue;
        if (photo.preview) URL.revokeObjectURL(photo.preview);
        photo.file = this.storedFileToFile(savedPhoto.file);
        photo.preview = photo.file ? URL.createObjectURL(photo.file) : '';
      }

      if (this.testDriveVideo.preview) URL.revokeObjectURL(this.testDriveVideo.preview);
      this.testDriveVideo.file = this.storedFileToFile(draft.testDriveVideo);
      this.testDriveVideo.preview = this.testDriveVideo.file
        ? URL.createObjectURL(this.testDriveVideo.file)
        : '';
      this.testDriveVideo.processing = false;

      this.draftRestored = true;
      this.draftSavedAt = new Date(draft.savedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Inspection draft restore failed:', error);
    }
  }

  private async deleteInspectionDraft(): Promise<void> {
    if (!this.requestId) return;

    try {
      const db = await this.openDraftDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.DRAFT_STORE_NAME, 'readwrite');
        transaction.objectStore(this.DRAFT_STORE_NAME).delete(this.requestId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(
          transaction.error || new Error('Unable to delete inspection draft.')
        );
      });
      db.close();
    } catch (error) {
      console.error('Inspection draft delete failed:', error);
    }
  }

  @HostListener('document:visibilitychange')
  onDocumentVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      void this.saveInspectionDraft();
    }
  }

  @HostListener('window:pagehide')
  onPageHide(): void {
    void this.saveInspectionDraft();
  }

  // ======================================================
  // INITIALIZE DETAILED INSPECTION
  // ======================================================

  private initializeDetailedInspection(): void {

    this.detailedInspection = {};

    this.detailedRowRemarks = {};

    this.detailedRowImages = {};

    this.openInspectionSections = {};

    for (
      const section
      of this.inspectionSections
    ) {

      this.detailedInspection[
        section.key
      ] = {};

      this.openInspectionSections[
        section.key
      ] = false;

      for (
        const row
        of section.rows
      ) {

        const rowName =
          row[0];

        this.detailedInspection[
          section.key
        ][rowName] = [];

        const key =
          this.getDetailedRowKey(
            section.key,
            rowName
          );

        this.detailedRowRemarks[
          key
        ] = '';

        this.detailedRowImages[
          key
        ] = {
          file: null,
          preview: ''
        };
      }
    }
  }


  // ======================================================
  // SECTION DROPDOWN
  // ======================================================

  toggleInspectionSection(
    sectionKey: string
  ): void {

    this.openInspectionSections[
      sectionKey
    ] =
      !this.openInspectionSections[
        sectionKey
      ];
  }


  // ======================================================
  // ROW KEY
  // ======================================================

  getDetailedRowKey(
    sectionKey: string,
    rowName: string
  ): string {

    return `${sectionKey}__${rowName}`;
  }


  // ======================================================
  // OPTIONAL DETAILED ROWS
  // Seat 3rd Row RHS and Seat 3rd Row LHS are optional.
  // Every other detailed inspection row remains required.
  // ======================================================
  isDetailedRowOptional(
    sectionKey: string,
    rowName: string
  ): boolean {
    return (
      sectionKey === 'all_seats' &&
      (
        rowName === 'Seat 3rd Row RHS' ||
        rowName === 'Seat 3rd Row LHS'
      )
    );
  }


  // ======================================================
  // CHECKBOX
  // ======================================================

  toggleInspectionOption(
    sectionKey: string,
    rowName: string,
    option: string
  ): void {

    const current =
      this.detailedInspection[
        sectionKey
      ]?.[rowName] || [];

    const index =
      current.indexOf(option);

    if (index >= 0) {

      current.splice(index, 1);

    } else {

      current.push(option);
    }

    this.detailedInspection[
      sectionKey
    ][rowName] = [
      ...current
    ];

    this.syncDetailedInspectionToChecklist();
    this.scheduleDraftSave();
  }


  // ======================================================
  // CHECKBOX SELECTED
  // ======================================================

  isInspectionOptionSelected(
    sectionKey: string,
    rowName: string,
    option: string
  ): boolean {

    return (
      this.detailedInspection[
        sectionKey
      ]?.[rowName] || []
    ).includes(option);
  }


  // ======================================================
  // CHECKBOX DISABLED STATE
  // OK/No imperfection and issue options are mutually exclusive.
  // ======================================================

  isInspectionOptionDisabled(
    sectionKey: string,
    rowName: string,
    option: string
  ): boolean {

    const selected =
      this.detailedInspection[
        sectionKey
      ]?.[rowName] || [];

    if (
      option ===
      'Ok/No imperfection'
    ) {
      return selected.some(
        value =>
          value !==
          'Ok/No imperfection'
      );
    }

    return selected.includes(
      'Ok/No imperfection'
    );
  }


  // ======================================================
  // TEMPLATE VALIDATION HELPER
  // ======================================================

  hasValidationError(
    key: string
  ): boolean {
    return this.validationErrors.has(key);
  }


  // ======================================================
  // SELECTED COUNT
  // ======================================================

  getSelectedOptionCount(
    sectionKey: string,
    rowName: string
  ): number {

    return (
      this.detailedInspection[
        sectionKey
      ]?.[rowName] || []
    ).length;
  }


  // ======================================================
  // SECTION HAS ISSUE
  // ======================================================

  hasInspectionIssue(
    sectionKey: string
  ): boolean {

    const section =
      this.detailedInspection[
        sectionKey
      ] || {};

    return Object.values(
      section
    ).some(
      (values: string[]) =>
        values.some(
          value =>
            value !==
            'Ok/No imperfection' &&
            value !==
            'Not Applicable'
        )
    );
  }


  // ======================================================
  // ROW REMARK
  // ======================================================

  getDetailedRowRemark(
    sectionKey: string,
    rowName: string
  ): string {

    return this.detailedRowRemarks[
      this.getDetailedRowKey(
        sectionKey,
        rowName
      )
    ] || '';
  }


  setDetailedRowRemark(
    sectionKey: string,
    rowName: string,
    value: string
  ): void {

    this.detailedRowRemarks[
      this.getDetailedRowKey(
        sectionKey,
        rowName
      )
    ] = value;

    this.syncDetailedInspectionToChecklist();
    this.scheduleDraftSave();
  }


  // ======================================================
  // BUILD DETAILED REMARK
  // ======================================================

  buildDetailedRemark(
    sectionKey: string
  ): string {

    const section =
      this.detailedInspection[
        sectionKey
      ] || {};

    return Object.entries(
      section
    )
      .filter(
        ([, values]) =>
          values.length > 0
      )
      .map(
        ([row, values]) => {

          const key =
            this.getDetailedRowKey(
              sectionKey,
              row
            );

          const remark =
            this.detailedRowRemarks[
              key
            ] || '';

          return `${row}: ${values.join(', ')}${
            remark.trim()
              ? ` - ${remark.trim()}`
              : ''
          }`;
        }
      )
      .join(' | ');
  }


  // ======================================================
  // SYNC DETAILED INSPECTION
  // ======================================================

  syncDetailedInspectionToChecklist(): void {

    const map:
      Record<string, string> = {

      exterior:
        'exterior_body',

      engine_bay:
        'engine',

      suspension_steering:
        'steering',

      interior_electricals:
        'electrical',

      electricals_ac:
        'ac_heater',

      transmission_system:
        'transmission',

      braking_system:
        'brakes',

      tires_wheels:
        'tyres',

      documents_title:
        'documents'
    };


    for (
      const section
      of this.inspectionSections
    ) {

      const item =
        this.checklistItems.find(
          checklistItem =>
            checklistItem.key ===
            map[section.key]
        );

      if (!item) {
        continue;
      }

      item.status =
        this.hasInspectionIssue(
          section.key
        )
          ? 'Need Attention'
          : 'Good';

      item.remark =
        this.buildDetailedRemark(
          section.key
        );
    }

    this.scheduleDraftSave();
  }


  // ======================================================
  // FAST IMAGE COMPRESSION
  // ======================================================
  // Large gallery photos are the main reason Submit takes time.
  // Keep small images untouched; resize/compress only large ones.
  private async optimizeImageForUpload(file: File): Promise<File> {
    const MAX_BYTES = 900 * 1024;       // ~900 KB
    const MAX_DIMENSION = 1600;
    const MIN_QUALITY = 0.72;

    if (!file.type.startsWith('image/') || file.size <= MAX_BYTES) {
      return file;
    }

    return new Promise<File>((resolve) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        try {
          const scale = Math.min(
            1,
            MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
          );

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

          const context = canvas.getContext('2d');
          if (!context) {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            blob => {
              URL.revokeObjectURL(objectUrl);

              if (!blob || blob.size >= file.size) {
                resolve(file);
                return;
              }

              const baseName = file.name.replace(/\.[^.]+$/, '');
              resolve(
                new File(
                  [blob],
                  `${baseName}-optimized.jpg`,
                  { type: 'image/jpeg' }
                )
              );
            },
            'image/jpeg',
            MIN_QUALITY
          );
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      image.src = objectUrl;
    });
  }

  // ======================================================
  // GALLERY - DETAILED ROW
  // ======================================================

  async onDetailedRowGallerySelected(
    event: Event,
    sectionKey: string,
    rowName: string
  ): Promise<void> {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      !input.files.length
    ) {

      return;
    }

    const file =
      input.files[0];

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      this.errorMessage =
        'Please select a valid image file.';

      input.value = '';

      return;
    }

    const optimizedFile =
      await this.optimizeImageForUpload(file);

    this.setDetailedRowImage(
      sectionKey,
      rowName,
      optimizedFile
    );

    input.value = '';
  }


  // ======================================================
  // SET DETAILED IMAGE
  // ======================================================

  private setDetailedRowImage(
    sectionKey: string,
    rowName: string,
    file: File
  ): void {

    const key =
      this.getDetailedRowKey(
        sectionKey,
        rowName
      );

    const current =
      this.detailedRowImages[
        key
      ];

    if (
      current?.preview
    ) {

      URL.revokeObjectURL(
        current.preview
      );
    }

    this.detailedRowImages[
      key
    ] = {

      file,

      preview:
        URL.createObjectURL(
          file
        )
    };

    this.errorMessage = '';
  }


  // ======================================================
  // GET DETAILED IMAGE
  // ======================================================

  getDetailedRowImage(
    sectionKey: string,
    rowName: string
  ): DetailedRowImage {

    return this.detailedRowImages[
      this.getDetailedRowKey(
        sectionKey,
        rowName
      )
    ] || {
      file: null,
      preview: ''
    };
  }


  // ======================================================
  // REMOVE DETAILED IMAGE
  // ======================================================

  removeDetailedRowImage(
    sectionKey: string,
    rowName: string
  ): void {

    const key =
      this.getDetailedRowKey(
        sectionKey,
        rowName
      );

    const current =
      this.detailedRowImages[
        key
      ];

    if (
      current?.preview
    ) {

      URL.revokeObjectURL(
        current.preview
      );
    }

    this.detailedRowImages[
      key
    ] = {
      file: null,
      preview: ''
    };

    this.scheduleDraftSave();
  }


  // ======================================================
  // ACTUAL CAMERA
  // ======================================================

  // ======================================================
  // OPEN VEHICLE PHOTO CAMERA
  // ======================================================

  async openVehicleCamera(key: string): Promise<void> {

    this.closeCamera();

    this.cameraTarget = {
      mode: 'vehicle',
      key
    };

    this.errorMessage = '';

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.errorMessage =
          'Camera is not supported by this browser. Please use Gallery.';
        this.cameraTarget = null;
        return;
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.cameraOpen = true;

      setTimeout(() => {
        const video = document.getElementById(
          'inspectionCameraVideo'
        ) as HTMLVideoElement | null;

        if (!video) return;

        this.cameraVideo = video;
        video.srcObject = this.cameraStream;
        video.play().catch(() => {});
      }, 100);

    } catch (error) {
      console.error('Vehicle camera error:', error);
      this.closeCamera();
      this.errorMessage =
        'Unable to open camera. Please allow camera permission or use Gallery.';
    }
  }


  async openTestDrivePhotoCamera(key: TestDrivePhoto['key']): Promise<void> {
    this.closeCamera();
    this.cameraTarget = { mode: 'test_drive', key };
    this.errorMessage = '';

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported by this browser. Please use Gallery.');
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.cameraOpen = true;
      setTimeout(() => {
        const video = document.getElementById('inspectionCameraVideo') as HTMLVideoElement | null;
        if (!video) return;
        this.cameraVideo = video;
        video.srcObject = this.cameraStream;
        video.play().catch(() => {});
      }, 100);
    } catch (error: any) {
      console.error('Test drive photo camera error:', error);
      this.closeCamera();
      this.errorMessage = error?.message || 'Unable to open camera. Please allow camera permission or use Gallery.';
    }
  }

  async openDocumentCamera(key: DocumentPhoto['key']): Promise<void> {
    this.closeCamera();
    this.cameraTarget = { mode: 'document', key };
    this.errorMessage = '';

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported by this browser. Please use Gallery.');
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      this.cameraOpen = true;
      setTimeout(() => {
        const video = document.getElementById('inspectionCameraVideo') as HTMLVideoElement | null;
        if (!video) return;
        this.cameraVideo = video;
        video.srcObject = this.cameraStream;
        video.play().catch(() => {});
      }, 100);
    } catch (error: any) {
      this.closeCamera();
      this.errorMessage = error?.message || 'Unable to open camera. Please allow camera permission or use Gallery.';
    }
  }

  private captureDocumentCameraPhoto(): void {
    if (!this.cameraVideo || !this.cameraTarget || this.cameraTarget.mode !== 'document') return;

    const video = this.cameraVideo;
    if (!video.videoWidth || !video.videoHeight) {
      this.errorMessage = 'Camera is not ready yet. Please try again.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const key = this.cameraTarget.key;
    canvas.toBlob(blob => {
      if (!blob) return;
      const photo = this.documentPhotos.find(item => item.key === key);
      if (!photo) return;
      if (photo.preview) URL.revokeObjectURL(photo.preview);
      photo.file = new File([blob], `document-${key}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      photo.preview = URL.createObjectURL(photo.file);
      this.scheduleDraftSave();
      this.closeCamera();
    }, 'image/jpeg', 0.9);
  }

  async onDocumentPhotoSelected(event: Event, photo: DocumentPhoto): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }

    const optimizedFile =
      await this.optimizeImageForUpload(file);

    if (photo.preview) URL.revokeObjectURL(photo.preview);
    photo.file = optimizedFile;
    photo.preview = URL.createObjectURL(optimizedFile);
    this.errorMessage = '';
    this.scheduleDraftSave();
  }

  removeDocumentPhoto(key: DocumentPhoto['key']): void {
    const photo = this.documentPhotos.find(item => item.key === key);
    if (!photo) return;
    if (photo.preview) URL.revokeObjectURL(photo.preview);
    photo.file = null;
    photo.preview = '';
    this.scheduleDraftSave();
  }

  async openDetailedCamera(
    sectionKey: string,
    rowName: string
  ): Promise<void> {

    this.cameraTarget = {
      mode: 'detailed',
      sectionKey,
      rowName
    };

    this.errorMessage = '';

    try {

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        this.errorMessage =
          'Camera is not supported by this browser. Please use Gallery.';

        this.cameraTarget = null;

        return;
      }

      this.cameraStream =
        await navigator.mediaDevices
          .getUserMedia({

            video: {

              facingMode: {
                ideal: 'environment'
              },

              width: {
                ideal: 1280
              },

              height: {
                ideal: 720
              }

            },

            audio: false

          });

      this.cameraOpen = true;

      setTimeout(() => {

        const video =
          document.getElementById(
            'inspectionCameraVideo'
          ) as HTMLVideoElement | null;

        if (!video) {
          return;
        }

        this.cameraVideo =
          video;

        video.srcObject =
          this.cameraStream;

        video.play()
          .catch(() => {});

      }, 100);

    } catch (error) {

      console.error(
        'Inspection camera error:',
        error
      );

      this.closeCamera();

      this.errorMessage =
        'Unable to open camera. Please allow camera permission or use Gallery.';
    }
  }


  // ======================================================
  // CAPTURE CAMERA PHOTO
  // ======================================================

  captureDetailedCameraPhoto(): void {

    if (
      !this.cameraVideo ||
      !this.cameraTarget
    ) {

      return;
    }

    if (this.cameraTarget.mode === 'vehicle') {
      this.captureVehicleCameraPhoto();
      return;
    }

    if (this.cameraTarget.mode === 'test_drive') {
      this.captureTestDriveCameraPhoto();
      return;
    }

    if (this.cameraTarget.mode === 'document') {
      this.captureDocumentCameraPhoto();
      return;
    }

    const video =
      this.cameraVideo;

    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {

      this.errorMessage =
        'Camera is not ready yet. Please try again.';

      return;
    }

    const canvas =
      document.createElement(
        'canvas'
      );

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext(
        '2d'
      );

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const target =
      this.cameraTarget;

    canvas.toBlob(
      blob => {

        if (!blob) {
          return;
        }

        const file =
          new File(
            [blob],
            `inspection-${Date.now()}.jpg`,
            {
              type:
                'image/jpeg'
            }
          );

        this.setDetailedRowImage(
          target.sectionKey,
          target.rowName,
          file
        );

        this.closeCamera();

      },
      'image/jpeg',
      0.90
    );
  }


  // ======================================================
  // CAPTURE VEHICLE CAMERA PHOTO
  // ======================================================

  private captureTestDriveCameraPhoto(): void {
    if (!this.cameraVideo || !this.cameraTarget || this.cameraTarget.mode !== 'test_drive') return;

    const video = this.cameraVideo;
    if (!video.videoWidth || !video.videoHeight) {
      this.errorMessage = 'Camera is not ready yet. Please try again.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      this.errorMessage = 'Unable to capture camera image.';
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const target = this.cameraTarget;

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `test-drive-${target.key}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const photo = this.testDrivePhotos.find(item => item.key === target.key);
      if (photo) {
        if (photo.preview) URL.revokeObjectURL(photo.preview);
        photo.file = file;
        photo.preview = URL.createObjectURL(file);
        this.scheduleDraftSave();
      }
      this.closeCamera();
    }, 'image/jpeg', 0.90);
  }

  private captureVehicleCameraPhoto(): void {

    if (
      !this.cameraVideo ||
      !this.cameraTarget ||
      this.cameraTarget.mode !== 'vehicle'
    ) {
      return;
    }

    const video = this.cameraVideo;

    if (!video.videoWidth || !video.videoHeight) {
      this.errorMessage =
        'Camera is not ready yet. Please try again.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      this.errorMessage = 'Unable to capture camera image.';
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const key = this.cameraTarget.key;

    canvas.toBlob((blob) => {
      if (!blob) {
        this.errorMessage = 'Unable to create captured image.';
        return;
      }

      const file = new File(
        [blob],
        `vehicle-${key}-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      this.setVehiclePhoto(key, file);
      this.closeCamera();
    }, 'image/jpeg', 0.9);
  }


  async onTestDrivePhotoSelected(event: Event, photo: TestDrivePhoto): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file.';
      return;
    }

    const optimizedFile =
      await this.optimizeImageForUpload(file);

    if (photo.preview) URL.revokeObjectURL(photo.preview);
    photo.file = optimizedFile;
    photo.preview = URL.createObjectURL(optimizedFile);
    this.errorMessage = '';
    this.scheduleDraftSave();
  }

  removeTestDrivePhoto(key: TestDrivePhoto['key']): void {
    const photo = this.testDrivePhotos.find(item => item.key === key);
    if (!photo) return;
    if (photo.preview) URL.revokeObjectURL(photo.preview);
    photo.file = null;
    photo.preview = '';
    this.scheduleDraftSave();
  }

  async openTestDriveVideoCamera(): Promise<void> {
    this.videoCameraTarget = 'test_drive_video';
    this.errorMessage = '';

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Video camera recording is not supported by this browser. Please use Gallery.');
      }

      this.videoCameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      this.videoCameraOpen = true;
      setTimeout(() => {
        const video = document.getElementById('inspectionVideoCameraVideo') as HTMLVideoElement | null;
        if (!video) return;
        this.videoCameraVideo = video;
        video.srcObject = this.videoCameraStream;
        video.muted = true;
        video.play().catch(() => {});
      }, 100);
    } catch (error: any) {
      this.closeVideoCamera();
      this.errorMessage = error?.message || 'Unable to open video camera. Please allow camera/microphone permission or use Gallery.';
    }
  }

  // ======================================================
  // VIDEO CAMERA
  // ======================================================

  async openInspectionVideoCamera(key: InspectionVideo['key']): Promise<void> {
    this.videoCameraTarget = key;
    this.errorMessage = '';

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Video camera recording is not supported by this browser. Please use Gallery.');
      }

      this.videoCameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      this.videoCameraOpen = true;

      setTimeout(() => {
        const video = document.getElementById('inspectionVideoCameraVideo') as HTMLVideoElement | null;
        if (!video) return;
        this.videoCameraVideo = video;
        video.srcObject = this.videoCameraStream;
        video.muted = true;
        video.play().catch(() => {});
      }, 100);
    } catch (error: any) {
      this.closeVideoCamera();
      this.errorMessage = error?.message || 'Unable to open video camera. Please allow camera/microphone permission or use Gallery.';
    }
  }

  startInspectionVideoRecording(): void {
    if (!this.videoCameraStream || !this.videoCameraTarget || this.videoRecording) return;

    const mimeTypes = [
      'video/mp4;codecs=h264,aac',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

    this.videoRecorderChunks = [];
    this.videoRecorder = mimeType
      ? new MediaRecorder(this.videoCameraStream, { mimeType, videoBitsPerSecond: 1200000, audioBitsPerSecond: 96000 })
      : new MediaRecorder(this.videoCameraStream, { videoBitsPerSecond: 1200000, audioBitsPerSecond: 96000 });

    this.videoRecorder.ondataavailable = event => {
      if (event.data?.size) this.videoRecorderChunks.push(event.data);
    };

    this.videoRecorder.onstop = async () => {
      const blob = new Blob(this.videoRecorderChunks, { type: this.videoRecorder?.mimeType || mimeType || 'video/webm' });
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `inspection-${this.videoCameraTarget}-${Date.now()}.${extension}`, { type: blob.type });
      const target = this.videoCameraTarget;
      this.videoRecording = false;
      this.videoRecorder = null;
      this.videoRecorderChunks = [];
      this.closeVideoCamera();
      if (!target) {
        this.errorMessage = 'Unable to determine the video type. Please record again.';
        return;
      }
      if (target === 'test_drive_video') {
        await this.setTestDriveVideo(file);
      } else {
        await this.setInspectionVideo(target, file);
      }
    };

    this.videoRecorder.onerror = () => {
      this.videoRecording = false;
      this.errorMessage = 'Video recording failed. Please try again or use Gallery.';
    };

    this.videoRecorder.start(1000);
    this.videoRecording = true;
  }

  stopInspectionVideoRecording(): void {
    if (!this.videoRecorder || this.videoRecorder.state === 'inactive') return;
    this.videoRecorder.stop();
  }

  closeVideoCamera(): void {
    if (this.videoRecorder && this.videoRecorder.state !== 'inactive') {
      this.videoRecorder.stop();
    }

    if (this.videoCameraStream) {
      this.videoCameraStream.getTracks().forEach(track => track.stop());
    }

    this.videoCameraStream = null;
    this.videoCameraVideo = null;
    this.videoCameraTarget = null;
    this.videoCameraOpen = false;
    this.videoRecording = false;
    this.videoRecorder = null;
    this.videoRecorderChunks = [];
  }

  // ======================================================
  // VIDEO SELECT / COMPRESSION
  // ======================================================

  async onInspectionVideoSelected(event: Event, key: InspectionVideo['key']): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!file.type.startsWith('video/')) {
      this.errorMessage = 'Please select a valid video file.';
      return;
    }

    await this.setInspectionVideo(key, file);
  }

  private async setInspectionVideo(key: InspectionVideo['key'], file: File): Promise<void> {
    const video = this.inspectionVideos.find(item => item.key === key);
    if (!video) return;

    video.processing = true;
    this.errorMessage = '';

    try {
      const compressed = await this.compressInspectionVideo(file);

      if (compressed.size > 25 * 1024 * 1024) {
        throw new Error('Video is still larger than 25 MB after compression. Please record a shorter video.');
      }

      if (video.preview) URL.revokeObjectURL(video.preview);

      video.file = compressed;
      video.preview = URL.createObjectURL(compressed);
      this.scheduleDraftSave();
    } catch (error: any) {
      video.file = null;
      if (video.preview) URL.revokeObjectURL(video.preview);
      video.preview = '';
      this.errorMessage = error?.message || 'Unable to compress video. Please try a shorter video.';
    } finally {
      video.processing = false;
    }
  }

  private async compressInspectionVideo(file: File): Promise<File> {
    const maxBytes = 8 * 1024 * 1024;

    if (file.size <= maxBytes) {
      const originalExtension = file.name.includes('.')
        ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
        : (file.type.includes('webm') ? '.webm' : '.mp4');

      return new File(
        [file],
        `${file.name.replace(/\.[^.]+$/, '')}-compressed${originalExtension}`,
        { type: file.type || (originalExtension === '.webm' ? 'video/webm' : 'video/mp4') }
      );
    }

    if (typeof MediaRecorder === 'undefined') {
      throw new Error('Video compression is not supported by this browser. Please use a shorter video.');
    }

    const source = document.createElement('video');
    source.preload = 'metadata';
    source.playsInline = true;
    source.muted = false;
    source.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      source.onloadedmetadata = () => resolve();
      source.onerror = () => reject(new Error('Unable to read selected video.'));
    });

    const duration = Math.max(1, source.duration || 1);
    const targetBitrate = Math.min(1400000, Math.max(500000, Math.floor((maxBytes * 8 * 0.85) / duration)));
    const stream = (source as any).captureStream?.() || (source as any).mozCaptureStream?.();

    if (!stream) {
      URL.revokeObjectURL(source.src);
      throw new Error('Video compression is not supported on this browser. Please use a shorter video.');
    }

    const mimeTypes = [
      'video/mp4;codecs=h264,aac',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: targetBitrate, audioBitsPerSecond: 96000 })
      : new MediaRecorder(stream, { videoBitsPerSecond: targetBitrate, audioBitsPerSecond: 96000 });

    const chunks: Blob[] = [];

    const result = await new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = event => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error('Video compression failed.'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || 'video/webm' }));

      recorder.start(1000);
      source.onended = () => {
        if (recorder.state !== 'inactive') recorder.stop();
      };
      source.play().catch(() => reject(new Error('Unable to play video for compression.')));
    });

    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    URL.revokeObjectURL(source.src);

    const extension = result.type.includes('mp4') ? 'mp4' : 'webm';
    return new File(
      [result],
      `${file.name.replace(/\.[^.]+$/, '')}-compressed.${extension}`,
      { type: result.type }
    );
  }

  async onTestDriveVideoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      this.errorMessage = 'Please select a valid video file.';
      return;
    }
    await this.setTestDriveVideo(file);
  }

  private async setTestDriveVideo(file: File): Promise<void> {
    this.testDriveVideo.processing = true;
    this.errorMessage = '';
    try {
      const compressed = await this.compressInspectionVideo(file);
      if (compressed.size > 25 * 1024 * 1024) {
        throw new Error('Test Drive Video is still larger than 25 MB after compression. Please record a shorter video.');
      }
      if (this.testDriveVideo.preview) URL.revokeObjectURL(this.testDriveVideo.preview);
      this.testDriveVideo.file = compressed;
      this.testDriveVideo.preview = URL.createObjectURL(compressed);
      this.scheduleDraftSave();
    } catch (error: any) {
      this.testDriveVideo.file = null;
      if (this.testDriveVideo.preview) URL.revokeObjectURL(this.testDriveVideo.preview);
      this.testDriveVideo.preview = '';
      this.errorMessage = error?.message || 'Unable to compress Test Drive Video.';
    } finally {
      this.testDriveVideo.processing = false;
    }
  }

  removeTestDriveVideo(): void {
    if (this.testDriveVideo.preview) URL.revokeObjectURL(this.testDriveVideo.preview);
    this.testDriveVideo.file = null;
    this.testDriveVideo.preview = '';
    this.testDriveVideo.processing = false;
    this.scheduleDraftSave();
  }

  removeInspectionVideo(key: InspectionVideo['key']): void {
    const video = this.inspectionVideos.find(item => item.key === key);
    if (!video) return;

    if (video.preview) URL.revokeObjectURL(video.preview);
    video.file = null;
    video.preview = '';
    video.processing = false;
    this.scheduleDraftSave();
  }

  getInspectionVideo(key: InspectionVideo['key']): InspectionVideo | undefined {
    return this.inspectionVideos.find(item => item.key === key);
  }

  getInspectionVideoKeyForRow(rowName: string): 'engine_video' | 'engine_blow_by_video' | null {
    if (rowName === 'Engine') return 'engine_video';
    if (rowName === 'Engine Blow By') return 'engine_blow_by_video';
    return null;
  }

  // ======================================================
  // CLOSE CAMERA
  // ======================================================

  closeCamera(): void {

    if (
      this.cameraStream
    ) {

      this.cameraStream
        .getTracks()
        .forEach(
          track =>
            track.stop()
        );
    }

    this.cameraStream =
      null;

    this.cameraVideo =
      null;

    this.cameraTarget =
      null;

    this.cameraOpen =
      false;
  }


  // ======================================================
  // DATE FORMAT
  // ======================================================

  private formatDateForInput(
    value: string
  ): string {

    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;
    }

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


  // ======================================================
  // CHECKLIST STATUS CHANGE
  // ======================================================

  onChecklistStatusChange(
    item: ChecklistItem
  ): void {

    if (
      item.status === 'Good'
    ) {

      return;
    }

    if (
      item.status === 'Need Attention'
    ) {

      return;
    }

    if (
      item.status === 'Issue'
    ) {

      return;
    }
  }


  // ======================================================
  // CHECKLIST IMAGE
  // ======================================================

  async onChecklistImageSelected(
    event: Event,
    item: ChecklistItem
  ): Promise<void> {

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

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      this.errorMessage =
        'Please select a valid image file.';

      input.value = '';

      return;
    }

    const optimizedFile =
      await this.optimizeImageForUpload(file);

    item.file =
      optimizedFile;

    if (
      item.preview
    ) {

      URL.revokeObjectURL(
        item.preview
      );
    }

    item.preview =
      URL.createObjectURL(
        optimizedFile
      );

    this.errorMessage = '';
    input.value = '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // REMOVE CHECKLIST IMAGE
  // ======================================================

  removeChecklistImage(
    item: ChecklistItem
  ): void {

    if (
      item.preview
    ) {

      URL.revokeObjectURL(
        item.preview
      );
    }

    item.file =
      null;

    item.preview =
      '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // VEHICLE PHOTO SELECT
  // ======================================================

  private setVehiclePhoto(key: string, file: File): void {

    const photo = [
      ...this.vehiclePhotos,
      ...this.additionalVehiclePhotos
    ].find(
      item => item.key === key
    );

    if (!photo) return;

    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    photo.file = file;
    photo.preview = URL.createObjectURL(file);
    this.scheduleDraftSave();
  }


  async onVehiclePhotoSelected(
    event: Event,
    photoOrKey: VehiclePhoto | string
  ): Promise<void> {

    const photo =
      typeof photoOrKey === 'string'
        ? [
            ...this.vehiclePhotos,
            ...this.additionalVehiclePhotos
          ].find(
            item => item.key === photoOrKey
          )
        : photoOrKey;

    if (!photo) {
      return;
    }

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

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {

      this.errorMessage =
        'Please select a valid image file.';

      input.value = '';

      return;
    }

    const optimizedFile =
      await this.optimizeImageForUpload(file);

    photo.file =
      optimizedFile;

    if (
      photo.preview
    ) {

      URL.revokeObjectURL(
        photo.preview
      );
    }

    photo.preview =
      URL.createObjectURL(
        optimizedFile
      );

    this.errorMessage = '';
    input.value = '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // ADD OPTIONAL VEHICLE PHOTO
  // ======================================================

  addAdditionalVehiclePhoto(): void {
    if (
      this.additionalVehiclePhotos.length >=
      this.maxAdditionalVehiclePhotos
    ) {
      this.errorMessage =
        `You can add maximum ${this.maxAdditionalVehiclePhotos} additional vehicle photos.`;
      return;
    }

    const nextNumber =
      this.additionalVehiclePhotos.length + 1;

    this.additionalVehiclePhotos.push({
      key: `additional_vehicle_photo_${nextNumber}`,
      title: `Additional Photo ${nextNumber}`,
      file: null,
      preview: ''
    });

    this.errorMessage = '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // REMOVE OPTIONAL VEHICLE PHOTO SLOT
  // ======================================================

  removeAdditionalVehiclePhoto(
    photo: VehiclePhoto
  ): void {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }

    const index =
      this.additionalVehiclePhotos.indexOf(photo);

    if (index === -1) return;

    this.additionalVehiclePhotos.splice(index, 1);

    // Keep the remaining additional photo labels/keys ordered.
    this.additionalVehiclePhotos.forEach((item, itemIndex) => {
      const number = itemIndex + 1;
      item.key = `additional_vehicle_photo_${number}`;
      item.title = `Additional Photo ${number}`;
    });

    this.errorMessage = '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // REMOVE VEHICLE PHOTO
  // ======================================================

  removeVehiclePhoto(
    photo: VehiclePhoto
  ): void {

    if (
      photo.preview
    ) {

      URL.revokeObjectURL(
        photo.preview
      );
    }

    photo.file =
      null;

    photo.preview =
      '';
    this.scheduleDraftSave();
  }


  // ======================================================
  // CHECKLIST STATUS CLASS
  // ======================================================

  getChecklistStatusClass(
    status: string
  ): string {

    switch (status) {

      case 'Good':

        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'Need Attention':

        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'Issue':

        return 'bg-red-50 text-red-700 border-red-200';

      default:

        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }


  // ======================================================
  // SCORE SELECT
  // ======================================================

  selectScore(
    score: number
  ): void {

    if (
      score >= 1 &&
      score <= 10
    ) {

      this.overall_score =
        score;
      this.clearValidationState();
      this.scheduleDraftSave();
    }
  }


  // ======================================================
  // TRANSMISSION STAR RATING
  // ======================================================

  selectTransmissionRating(rating: number): void {
    if (rating >= 1 && rating <= 5) {
      this.transmission_rating = rating;
      this.scheduleDraftSave();
    }
  }

  getTransmissionRating(): number {
    return this.transmission_rating;
  }


  // ======================================================
  // VALIDATE
  // ======================================================

  isVehicleFieldInvalid(field: string): boolean {
    return this.invalidVehicleFields.has(field);
  }

  getDetailedRowValidationKey(sectionKey: string, rowName: string): string {
    return this.getDetailedRowKey(sectionKey, rowName);
  }

  isDetailedRowInvalid(sectionKey: string, rowName: string): boolean {
    return this.invalidDetailedRows.has(this.getDetailedRowValidationKey(sectionKey, rowName));
  }

  isVehiclePhotoInvalid(key: string): boolean {
    return this.invalidVehiclePhotos.has(key);
  }

  isInspectionVideoInvalid(key: InspectionVideo['key']): boolean {
    return this.invalidInspectionVideos.has(key);
  }

  clearValidationState(): void {
    this.invalidVehicleFields.clear();
    this.invalidDetailedRows.clear();
    this.invalidVehiclePhotos.clear();
    this.invalidInspectionVideos.clear();
    this.invalidOverallScore = false;
    this.validationErrorActive = false;
  }

  private focusFirstValidationError(): void {
    const firstInvalid = document.querySelector('.inspection-invalid') as HTMLElement | null;
    firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  validateForm(): boolean {

    this.errorMessage = '';
    this.clearValidationState();


    // ----------------------------------------------------
    // VEHICLE
    // ----------------------------------------------------

    if (!this.vehicle.brand.trim()) {
      this.invalidVehicleFields.add('brand');
      this.errorMessage = 'Vehicle brand is required.';
      this.validationErrorActive = true;
      return false;
    }


    if (!this.vehicle.model.trim()) {
      this.invalidVehicleFields.add('model');
      this.errorMessage = 'Vehicle model is required.';
      this.validationErrorActive = true;
      return false;
    }


    if (!this.vehicle.registration_number.trim()) {
      this.invalidVehicleFields.add('registration_number');
      this.errorMessage = 'Vehicle registration number is required.';
      this.validationErrorActive = true;
      return false;
    }


    if (!this.vehicle.manufacturing_year) {
      this.invalidVehicleFields.add('manufacturing_year');
      this.errorMessage = 'Manufacturing year is required.';
      this.validationErrorActive = true;
      return false;
    }


    if (this.vehicle.odometer === null || this.vehicle.odometer === undefined) {
      this.invalidVehicleFields.add('odometer');
      this.errorMessage = 'Odometer reading is required.';
      this.validationErrorActive = true;
      return false;
    }


    // ----------------------------------------------------
    // VEHICLE PHOTOS
    // Every required vehicle photo must be captured/uploaded.
    // ----------------------------------------------------

    for (const photo of this.vehiclePhotos) {
      if (!photo.file) {
        this.invalidVehiclePhotos.add(photo.key);
        this.errorMessage = `${photo.title}: vehicle photo is required.`;
        this.validationErrorActive = true;
        return false;
      }
    }

    for (const video of this.inspectionVideos) {
      if (!video.file) {
        this.invalidInspectionVideos.add(video.key);
        this.errorMessage = `${video.title} is required.`;
        this.validationErrorActive = true;
        return false;
      }
    }

    // Test Drive media is optional.



    // DETAILED INSPECTION
    // EVERY ROW NEEDS AT LEAST ONE TICK
    // ----------------------------------------------------

    for (
      const section
      of this.inspectionSections
    ) {

      for (
        const row
        of section.rows
      ) {

        const selected =
          this.detailedInspection[
            section.key
          ]?.[row[0]] || [];

        // 3rd-row seats are optional because they may not exist in every vehicle.
        if (
          this.isDetailedRowOptional(section.key, row[0])
        ) {
          continue;
        }

        const requiredVideoKey = this.getInspectionVideoKeyForRow(row[0]);

        if (selected.length === 0 || (requiredVideoKey && !this.getInspectionVideo(requiredVideoKey)?.file)) {
          this.invalidDetailedRows.add(
            this.getDetailedRowValidationKey(section.key, row[0])
          );
          if (requiredVideoKey && !this.getInspectionVideo(requiredVideoKey)?.file) {
            this.invalidInspectionVideos.add(requiredVideoKey);
          }
          this.errorMessage = selected.length === 0
            ? `${section.title} - ${row[0]}: Please select at least one inspection option.`
            : `${this.getInspectionVideo(requiredVideoKey!)?.title || 'Engine video'} is required.`;
          this.validationErrorActive = true;
          return false;
        }
      }
    }


    // ----------------------------------------------------
    // SCORE
    // ----------------------------------------------------

    if (this.overall_score === null || this.overall_score === undefined) {
      this.invalidOverallScore = true;
      this.errorMessage = 'Overall inspection score is required.';
      this.validationErrorActive = true;
      return false;
    }


    if (
      this.overall_score < 1 ||
      this.overall_score > 10
    ) {

      this.invalidOverallScore = true;
      this.errorMessage =
        'Overall score must be between 1 and 10.';
      this.validationErrorActive = true;
      return false;
    }

    // ----------------------------------------------------
    // CHECKLIST
    // ----------------------------------------------------

    for (
      const item
      of this.checklistItems
    ) {

      if (
        !item.status
      ) {

        this.errorMessage =
          `${item.title} status is required.`;

        return false;
      }
    }


    return true;
  }


  // ======================================================
  // PREPARE DETAILED CHECKLIST PAYLOAD FOR DATABASE + PDF
  // EXACT SAME ORDER AS THE EMPLOYEE FORM
  // ======================================================

  private buildDetailedChecklistPayload(): any[] {
    const result: any[] = [];

    for (const section of this.inspectionSections) {
      for (const row of section.rows) {
        const rowName = row[0];
        const selectedOptions = [
          ...(this.detailedInspection[section.key]?.[rowName] || [])
        ];

        const remark = this.getDetailedRowRemark(
          section.key,
          rowName
        ).trim();

        const hasIssue = selectedOptions.some(
          option => option !== 'Ok/No imperfection' && option !== 'Not Applicable'
        );

        result.push({
          category: section.key,
          section: section.key,
          section_title: section.title,
          item_name: rowName,
          status: hasIssue ? 'Need Attention' : 'Good',
          selected_options: selectedOptions,
          remark
        });
      }
    }

    return result;
  }


  // ======================================================
  // PREPARE CHECKLIST PAYLOAD
  // ======================================================

  private buildChecklistPayload(): any {

    const result: any = {};

    this.checklistItems.forEach(
      item => {

        result[item.key] = {

          title:
            item.title,

          description:
            item.description,

          status:
            item.status,

          remark:
            item.remark || ''

        };
      }
    );

    return result;
  }


  // ======================================================
  // PREPARE CHECKLIST REMARK
  // ======================================================

  private buildChecklistRemark(): string {

    return this.checklistItems

      .map(
        item =>
          `${item.title}: ${item.status}${
            item.remark
              ? ` - ${item.remark}`
              : ''
          }`
      )

      .join(' | ');
  }


  // ======================================================
  // SUBMIT INSPECTION
  // ======================================================

  submitInspection(): void {

    if (
      this.submitting
    ) {

      return;
    }


    if (!this.validateForm()) {
      setTimeout(() => this.focusFirstValidationError(), 0);
      return;
    }


    if (
      !this.request
    ) {

      this.errorMessage =
        'Inspection request not loaded.';

      return;
    }


    this.submitting = true;

    this.errorMessage = '';

    this.successMessage = '';


    // ----------------------------------------------------
    // CHECKLIST
    // ----------------------------------------------------

    const checklist =
      this.buildChecklistPayload();

    const detailedChecklist =
      this.buildDetailedChecklistPayload();


    // ----------------------------------------------------
    // PAYLOAD
    //
    // PRICE NOT INCLUDED
    // PUBLISH NOT INCLUDED
    // ----------------------------------------------------

    const payload = {

      vehicle: {

        ...this.vehicle

      },


      customer: {

        name:
          this.customer_name,

        mobile:
          this.owner_mobile,

        email:
          this.owner_email,

        address:
          this.owner_address,

        city:
          this.owner_city

      },


      engine_remark:
        this.engine_remark,

      overall_remark:
        this.overall_remark,

      overall_score:
        this.overall_score,

      transmission_rating:
        this.transmission_rating,


      // The Detailed Vehicle Inspection Checklist is the
      // actual inspection checklist shown to the employee.
      checklist:
        detailedChecklist,


      inspection_checklist:
        detailedChecklist,


      employeeRemark:
        this.employee_remark,


      checklist_summary:
        this.buildChecklistRemark(),


      detailedInspection:
        this.detailedInspection,


      detailedInspectionRemarks:
        this.detailedRowRemarks
    };


    // ----------------------------------------------------
    // UPLOAD FILES
    // First 10 = required Vehicle Photos.
    // Additional Vehicle Photos = optional extra photos (maximum 6).
    // Remaining = Detailed Vehicle Inspection row images.
    // The filename carries the exact section + row so the
    // backend can store and later place the image under the
    // correct checklist row in the PDF.
    // ----------------------------------------------------

    const vehicleImages = [
      ...this.vehiclePhotos,
      ...this.additionalVehiclePhotos
    ].map(photo => ({
      type: photo.title,
      row: photo.key,
      file: photo.file
    }));

    // DOCUMENT PHOTOS
    for (const photo of this.documentPhotos) {
      if (!photo.file) continue;
      const sourceFile = photo.file;
      const extension = sourceFile.name.includes('.')
        ? sourceFile.name.slice(sourceFile.name.lastIndexOf('.'))
        : '.jpg';
      const uploadFile = new File(
        [sourceFile],
        `__document__${photo.key}${extension}`,
        { type: sourceFile.type || 'image/jpeg' }
      );
      vehicleImages.push({
        type: `Document|${photo.key}|${photo.title}`,
        row: photo.key,
        file: uploadFile
      });
    }

    for (const section of this.inspectionSections) {
      for (const row of section.rows) {
        const rowName = row[0];
        const key = this.getDetailedRowKey(
          section.key,
          rowName
        );
        const detailedImage =
          this.detailedRowImages[key];

        if (!detailedImage?.file) {
          continue;
        }

        const sourceFile = detailedImage.file;
        const extension =
          sourceFile.name.includes('.')
            ? sourceFile.name.slice(
                sourceFile.name.lastIndexOf('.')
              )
            : '.jpg';

        const safeFileName =
          `__detailed__${section.key}__${encodeURIComponent(rowName)}${extension}`;

        const uploadFile = new File(
          [sourceFile],
          safeFileName,
          { type: sourceFile.type || 'image/jpeg' }
        );

        vehicleImages.push({
          type: `Detailed|${section.key}|${rowName}`,
          row: key,
          file: uploadFile
        });
      }
    }

    for (const video of this.inspectionVideos) {
      if (!video.file) continue;

      const sourceFile = video.file;
      const extension = sourceFile.name.includes('.')
        ? sourceFile.name.slice(sourceFile.name.lastIndexOf('.'))
        : '.mp4';

      const uploadFile = new File(
        [sourceFile],
        `__video__${video.key}${extension}`,
        { type: sourceFile.type || 'video/mp4' }
      );

      vehicleImages.push({
        type: `Video|${video.key}|${video.title}`,
        row: video.key,
        file: uploadFile
      });
    }

    for (const photo of this.testDrivePhotos) {
      if (!photo.file) continue;
      const sourceFile = photo.file;
      const extension = sourceFile.name.includes('.') ? sourceFile.name.slice(sourceFile.name.lastIndexOf('.')) : '.jpg';
      const uploadFile = new File([sourceFile], `__test_drive__${photo.key}${extension}`, { type: sourceFile.type || 'image/jpeg' });
      vehicleImages.push({
        type: `Test Drive Photo|${photo.key}|${photo.title}`,
        row: photo.key,
        file: uploadFile
      });
    }

    if (this.testDriveVideo.file) {
      const sourceFile = this.testDriveVideo.file;
      const extension = sourceFile.name.includes('.') ? sourceFile.name.slice(sourceFile.name.lastIndexOf('.')) : '.mp4';
      const uploadFile = new File([sourceFile], `__test_drive__test_drive_video${extension}`, { type: sourceFile.type || 'video/mp4' });
      vehicleImages.push({
        type: 'Test Drive Video|test_drive_video|Test Drive Video',
        row: 'test_drive_video',
        file: uploadFile
      });
    }

    this.employeeService
      .submitInspection(
        this.requestId,
        payload,
        vehicleImages
      )
      .subscribe({
        next: async (response: any) => {
          this.submitting = false;
          this.inspectionSubmitted = true;

          if (this.draftSaveTimer) {
            clearTimeout(this.draftSaveTimer);
            this.draftSaveTimer = null;
          }

          await this.deleteInspectionDraft();

          this.successMessage =
            response?.message ||
            'Inspection submitted successfully. PDF generated and email delivery processed.';

          setTimeout(() => {
            this.router.navigate(['/employee/dashboard']);
          }, 1800);
        },

        error: (error: any) => {
          this.submitting = false;
          this.errorMessage =
            error?.error?.message ||
            'Unable to submit inspection.';

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
  }

  // ======================================================
  // BACK
  // ======================================================

  async goBack(): Promise<void> {

    if (!this.inspectionSubmitted) {
      if (this.draftSaveTimer) {
        clearTimeout(this.draftSaveTimer);
        this.draftSaveTimer = null;
      }
      await this.saveInspectionDraft();
    }

    this.router.navigate([
      '/employee/dashboard'
    ]);
  }


  // ======================================================
  // TRACK BY CHECKLIST
  // ======================================================

  trackByChecklist(
    index: number,
    item: ChecklistItem
  ): string {

    return item.key;
  }


  // ======================================================
  // TRACK BY VEHICLE PHOTO
  // ======================================================

  trackByVehiclePhoto(
    index: number,
    photo: VehiclePhoto
  ): string {

    return photo.key;
  }


  // ======================================================
  // DESTROY
  // ======================================================

  ngOnDestroy(): void {

    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }

    if (!this.inspectionSubmitted) {
      void this.saveInspectionDraft();
    }

    this.closeCamera();
    this.closeVideoCamera();


    for (
      const image
      of Object.values(
        this.detailedRowImages
      )
    ) {

      if (
        image.preview
      ) {

        URL.revokeObjectURL(
          image.preview
        );
      }
    }


    for (
      const photo
      of this.vehiclePhotos
    ) {

      if (
        photo.preview
      ) {

        URL.revokeObjectURL(
          photo.preview
        );
      }
    }


    for (const video of this.inspectionVideos) {
      if (video.preview) {
        URL.revokeObjectURL(video.preview);
      }
    }

    for (const photo of this.testDrivePhotos) {
      if (photo.preview) URL.revokeObjectURL(photo.preview);
    }
    if (this.testDriveVideo.preview) URL.revokeObjectURL(this.testDriveVideo.preview);

    for (
      const item
      of this.checklistItems
    ) {

      if (
        item.preview
      ) {

        URL.revokeObjectURL(
          item.preview
        );
      }
    }
  }

}