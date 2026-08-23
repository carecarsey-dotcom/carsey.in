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
  Router
} from '@angular/router';

import {
  VehicleService
} from '../../services/vehicle.service';


type InspectionRow = [string, string[]];

interface InspectionSection {
  key: string;
  title: string;
  rows: InspectionRow[];
}

interface ChecklistItem {
  status: string;
  remark: string;
}


@Component({

  selector: 'app-add-vehicle',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './add-vehicle.component.html',

  styleUrl:
    './add-vehicle.component.css'

})
export class AddVehicleComponent {


  private vehicleService =
    inject(VehicleService);


  private router =
    inject(Router);


  // ==========================================
  // LOADING / MESSAGES
  // ==========================================

  loading = false;

  successMessage = '';

  errorMessage = '';


  // ==========================================
  // CUSTOMER COMMUNICATION
  // ==========================================

  showCustomerCommunication =
    false;


  publishedVehicleId:
    number | null = null;


  publishedReportId:
    number | null = null;


  customerEmail =
    '';


  customerWhatsApp =
    '';


  sendingCustomerEmail =
    false;


  customerEmailSuccess =
    '';


  customerEmailError =
    '';


  // ==========================================
  // VEHICLE BASIC INFORMATION
  // ==========================================

  vehicle = {

    brand: '',

    model: '',

    variant: '',

    manufacturing_year:
      new Date().getFullYear(),

    price:
      null as number | null,

    odometer:
      null as number | null,

    city: '',

    transmission:
      'Manual',

    fuel_type:
      'Petrol',

    owner_classification:
      'First',

    registration_number: '',

    chassis_number: '',

    engine_number: '',

    inspection_date: '',

    rto: '',

    spare_key:
      'Yes',

    insurance_type: '',

    insurance_validity: '',

    vehicle_note: '',

    status:
      'Draft'

  };


  // ==========================================
  // SHORT REMARKS
  // ==========================================

  variant_short_note =
    '';

  registration_rto_short_note =
    '';

  price_short_note =
    '';


  // ==========================================
  // CUSTOMER DETAILS
  // ==========================================

  customer_name =
    '';

  owner_mobile =
    '';

  alternate_mobile =
    '';

  owner_email =
    '';

  owner_address =
    '';

  owner_city =
    '';

  owner_state =
    '';

  owner_pincode =
    '';

  aadhar_number =
    '';

  pan_number =
    '';


  // ==========================================
  // INSPECTION CHECKLIST
  // ==========================================

  checklist: Record<string, ChecklistItem> = {

    exterior: {

      status:
        'Good',

      remark:
        ''

    },

    interior_electricals: {

      status:
        'Good',

      remark:
        ''

    },

    engine_bay: {

      status:
        'Good',

      remark:
        ''

    },

    transmission_system: {

      status:
        'Good',

      remark:
        ''

    },

    suspension_steering: {

      status:
        'Good',

      remark:
        ''

    },

    braking_system: {

      status:
        'Good',

      remark:
        ''

    },

    tires_wheels: {

      status:
        'Good',

      remark:
        ''

    },

    electricals_ac: {

      status:
        'Good',

      remark:
        ''

    },

    documents_title: {

      status:
        'Good',

      remark:
        ''

    }

  };



  // ==========================================
  // DETAILED INSPECTION OPTIONS
  // Backend remains unchanged.
  // Detailed selections are packed into the existing
  // 9 inspection_checklist remark fields.
  // ==========================================

  inspectionSections: InspectionSection[] = [
    {
      key: 'exterior',
      title: 'EXTERIOR + TYRE',
      rows: [
        ['Door Front RHS', ['Ok/No imperfection','Broking/Crack','Dented','Rusted','Scratch','Paint Mismatch','Repair + Repaint']],
        ['Door Rear RHS', ['Ok/No imperfection','Broking/Crack','Dented','Rusted','Scratch','Paint Mismatch','Repair + Repaint']],
        ['Door Front LHS', ['Ok/No imperfection','Broking/Crack','Dented','Rusted','Scratch','Paint Mismatch','Repair + Repaint']],
        ['Door Rear LHS', ['Ok/No imperfection','Broking/Crack','Dented','Rusted','Scratch','Paint Mismatch','Repair + Repaint']],
        ['ORVM RHS', ['Ok/No imperfection','Scratch + Faded','Mirror Crack','Folding Motor Not Working','Light Not Working']],
        ['ORVM LHS', ['Ok/No imperfection','Scratch + Faded','Mirror Crack','Folding Motor Not Working','Light Not Working']],
        ['Pillar A - RHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Pillar B - RHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Pillar C - RHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Pillar A - LHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Pillar B - LHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Pillar C - LHS', ['Ok/No imperfection','Paint Faded / Mismatch','Scratches','Dent','Rusting','Repaired + Welded']],
        ['Quarter Panel RHS', ['Ok/No imperfection','Fuel Lid Lock Not Working','Paint Issue + Mismatch + Faded','Dent','Rusting','Scratches','Repair + Repaint + Welded']],
        ['Quarter Panel LHS', ['Ok/No imperfection','Fuel Lid Lock Not Working','Paint Issue + Mismatch + Faded','Dent','Rusting','Scratches','Repair + Repaint + Welded']],
        ['Running Board RHS', ['Ok/No imperfection','Scratches','Dent','Rusted','Cladding Broken / Not Fixed Properly','Paint Mismatch / Hole / Crack']],
        ['Running Board LHS', ['Ok/No imperfection','Scratches','Dent','Rusted','Cladding Broken / Not Fixed Properly','Paint Mismatch / Hole / Crack']],
        ['Dicky / Boot Door', ['Ok/No imperfection','Scratches','Dent','Rusted','Boot Partial Missing','Jack & Tools Missing','Shocker Not Working','Dicky Lock Not Working','Spoiler Broken / Damage']],
        ['Tyre Front RHS', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
        ['Tyre Rear RHS', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
        ['Tyre Front LHS', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
        ['Tyre Rear LHS', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
        ['Spare Tyre', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
        ['Boot Floor', ['Ok/No imperfection','Water Logging','Welded / Repaired','Rusting','Dent','Hole & Crack']],
        ['Fender RHS', ['Ok/No imperfection','Dent','Scratch','Rusting','Lug Missing']],
        ['Fender LHS', ['Ok/No imperfection','Dent','Scratch','Rusting','Lug Missing']],
        ['Bonnet / Hood', ['Ok/No imperfection','Dent','Scratch','Rusting','Scooper Not Working','Crack / Hole']],
        ['Upper Cross Member', ['Ok/No imperfection','Rusting','Damage','Repaired / Welded']],
        ['Roof', ['Ok/No imperfection','Paint Mismatch + Faded','Dent','Crack / Hole','Scratches','Roof Rail Broken','Sun Roof Not Working']],
        ['Apron Both RHS', ['Ok/No imperfection','Repaired / Welded','Repainted','Rusting','Dent','Crack / Hole']],
        ['Apron Both LHS', ['Ok/No imperfection','Repaired / Welded','Repainted','Rusting','Dent','Crack / Hole']],
        ['Firewall', ['Ok/No imperfection','Rusted','Cover Damage','Carpet Damage','Crack & Hole','Repaired / Welded']],
      ]
    },
    {
      key: 'engine_bay',
      title: 'ENGINE + TRANSMISSION',
      rows: [
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
        ['Brakes Front RHS', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out']],
        ['Brakes Rear RHS', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out']],
        ['Brakes Front LHS', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out']],
        ['Brakes Rear LHS', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out']],
        ['Jumping Rod Bush Front RHS', ['Ok/No imperfection','Rusting','Assembly Noise']],
        ['Jumping Rod Bush Rear RHS', ['Ok/No imperfection','Rusting','Assembly Noise']],
        ['Jumping Rod Bush Rear LHS', ['Ok/No imperfection','Rusting','Assembly Noise']],
        ['Jumping Rod Bush Front LHS', ['Ok/No imperfection','Rusting','Assembly Noise']],
        ['Steering', ['Ok/No imperfection','Rack Boot Damage','Steering Pump Hard','Power Steering Oil Dirty','Steering Rack Noise']],
        ['Brake Master Cylinder', ['Ok/No imperfection','Leakage','Hard Brake','Spongy Brake']],
      ]
    },
    {
      key: 'interior_electricals',
      title: 'ELECTRICAL + INTERIOR + FEATURES',
      rows: [
        ['Cabinette Switch', ['Ok/No imperfection','Switch Broken','Not Working']],
        ['All Window Switch', ['Ok/No imperfection','Not Working','Power Window Noise','Switch Damage','Broken']],
        ['Dashboard', ['Ok/No imperfection','Faded','Glove Box Cover Damage','Broken','Bonnet Lever Not Working','Scratches']],
        ['Flooring', ['Ok/No imperfection','Water On Floor','Floor Rusting','Mat Missing','Crack & Hole']],
        ['Ceiling', ['Ok/No imperfection','Sun Visor Missing + Damage','Roof Handle Missing + Broken','Rear View Mirror Broken']],
        ['Lock System', ['Ok/No imperfection','Remote Key Not Working + Broken','Door Lock Knob Broken / Missing','Keyless Sensor Not Working','Mechanical Key Damage','Push Start Not Working']],
        ['Seat All', ['Ok/No imperfection','Seat Belt Damage','Dirty','Cover Torn','Seat Adjuster Not Working']],
        ['Steering Handle', ['Ok/No imperfection','Horn Not Working','Steering Handle Faded','Steering System Control Not Working']],
        ['Gear Lever', ['Ok/No imperfection','Boot Cover Torn','Knob Torn','Knob Broken']],
        ['Infotainment System', ['Ok/No imperfection','Not Applicable','Music System Crack','Speaker Not Working / Broken']],
        ['Instrument Cluster', ['Ok/No imperfection','Odometer Not Working','Glass Scratch / Minor / Major Deep','Speedometer Not Working','Tachometer Not Working','Air Bag Deployed','Air Bag Warning Light Glowing','Fuel Low','EPS','Air Suspension','Alternator + Battery','Air Bag','ABS','Transmission Warning','Oil Pressure Low','Engine Warning','Cruise Control','Non-Critical Warning Light','Trip Meter','Idle Start / Stop Not Working']],
      ]
    },
    {
      key: 'electricals_ac',
      title: 'AC + LIGHT',
      rows: [
        ['AC Unit', ['Ok/No imperfection','AC Cooling Not Working','AC Vent Not Fixed / Broken','Blower Motor Not Working','Noise','Heater Ineffective','AC Not Cooling','Cooling Fan Noise']],
        ['Head Light Both', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Fog Light Both', ['Ok/No imperfection','Not Applicable','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
        ['Tail Light', ['Ok/No imperfection','Fading','Broken','Crack','Moisture','Scratch','Light Not Working']],
      ]
    },
    {
      key: 'transmission_system',
      title: 'TRANSMISSION',
      rows: [
        ['Transmission Overall', ['Ok/No imperfection','Low Pickup','Clutch Noise','Bearing Damage','Spongy Clutch','Gear Shifting Hard']],
      ]
    },
    {
      key: 'braking_system',
      title: 'BRAKING',
      rows: [
        ['Brake Overall', ['Ok/No imperfection','Brake Oil Cap Missing','Brake Oil Level Low','Brake Pad Worn Out','Brake Disk Worn Out','Hard Brake','Spongy Brake']],
      ]
    },
    {
      key: 'tires_wheels',
      title: 'TYRES + WHEELS',
      rows: [
        ['Tyres / Wheels Overall', ['Ok/No imperfection','Tyre Crack','Rim Rusting','Wheel Cap Missing','Lug Nut Missing']],
      ]
    },
    {
      key: 'documents_title',
      title: 'DOCUMENTS + TITLE',
      rows: [
        ['Documents / Title', ['Ok/No imperfection','RC Available','Insurance Available','PUC Available','Service History Available','Duplicate Key Available','Chassis / VIN Match','Registration Details Match']],
      ]
    }
  ];

  detailedInspection: Record<string, Record<string, string[]>> = {};

  constructor() {
    this.initializeDetailedInspection();
  }

  private initializeDetailedInspection(): void {
    this.inspectionSections.forEach((section: InspectionSection) => {
      this.detailedInspection[section.key] = {};
      section.rows.forEach((row: InspectionRow) => {
        this.detailedInspection[section.key][row[0]] = [];
      });
    });
  }

  toggleInspectionOption(sectionKey: string, rowName: string, option: string): void {
    const current = this.detailedInspection[sectionKey]?.[rowName] || [];
    const index = current.indexOf(option);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(option);
    }

    this.detailedInspection[sectionKey][rowName] = [...current];
  }

  isInspectionOptionSelected(sectionKey: string, rowName: string, option: string): boolean {
    return (this.detailedInspection[sectionKey]?.[rowName] || []).includes(option);
  }

  hasInspectionIssue(sectionKey: string): boolean {
    const section = this.detailedInspection[sectionKey] || {};
    return Object.values(section).some(
      (values: string[]) =>
        values.length > 0 &&
        !values.includes('Ok/No imperfection')
    );
  }

  buildDetailedRemark(sectionKey: string): string {
    const section = this.detailedInspection[sectionKey] || {};
    const rows = Object.entries(section)
      .filter(([, values]) => values.length > 0)
      .map(([row, values]) => `${row}: ${values.join(', ')}`);

    return rows.length ? rows.join(' | ') : '';
  }

  syncDetailedInspectionToChecklist(): void {
    this.inspectionSections.forEach((section: InspectionSection) => {
      const remark = this.buildDetailedRemark(section.key);
      this.checklist[section.key].status =
        this.hasInspectionIssue(section.key)
          ? 'Need Attention'
          : 'Good';
      this.checklist[section.key].remark = remark;
    });
  }

  // ==========================================
  // ENGINE / OVERALL REMARKS
  // ==========================================

  engine_remark =
    '';

  overall_remark =
    '';


  // ==========================================
  // OVERALL SCORE
  // ==========================================

  overall_score =
    9.2;


  // ==========================================
  // STANDARD PHOTO OPTIONS
  // ==========================================
// ==========================================
// STANDARD PHOTO OPTIONS
// ==========================================

standardPhotoRows: string[] = [
  'Exterior Front Photo',
  'Engien Photo',
  'Exterio LHS Photo',
  'Dicky Boot',
  'Open Dicky',
  'Exterio RHS Photo',
  'Interior Photo',
  'Intero RHS',
  'Interior LHS',
  'Rear right',
  'Rear Left'
];

standardPhotoColumns: number[] = [
  1,
  2,
  3,
  4,
  5,
  6
];

// ==========================================
// IMAGE FILES
// ==========================================
//
// 11 rows x 6 columns = 66 image slots
//
// ==========================================

imageFiles: {
  type: string;
  row: string;
  column: number;
  file: File | null;
  preview: string;
}[] = this.standardPhotoRows.flatMap(
  (row: string) =>
    this.standardPhotoColumns.map(
      (column: number) => ({
        type:
          `${row} - Image ${column}`,

        row,

        column,

        file:
          null,

        preview:
          ''
      })
    )
);

// ==========================================
// VEHICLE IMAGES COMPATIBILITY
// ==========================================
//
// IMPORTANT:
// Existing system ke liye rakha gaya hai.
// Isko remove mat karna.
//
// ==========================================

vehicleImages: {
  type: string;
  row: string;
  column: number;
  file: File | null;
  preview: string;
}[] = this.imageFiles;

// ==========================================
// IMAGE LABELS
// ==========================================

imageLabels =
  this.standardPhotoRows;

// ==========================================
// SELECT IMAGE
// ==========================================

onImageSelected(
  event: Event,
  index: number
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

  if (
    !file.type.startsWith('image/')
  ) {
    this.errorMessage =
      'Please select a valid image file.';

    return;
  }

  // Maximum 10 MB
  if (
    file.size > 10 * 1024 * 1024
  ) {

    this.errorMessage =
      'Image size must be less than 10 MB.';

    return;
  }

  // Old preview remove
  if (
    this.imageFiles[index]?.preview
  ) {

    URL.revokeObjectURL(
      this.imageFiles[index].preview
    );
  }

  // Save file
  this.imageFiles[index].file =
    file;

  // Create preview
  this.imageFiles[index].preview =
    URL.createObjectURL(file);

  // Keep compatibility reference
  this.vehicleImages =
    this.imageFiles;

  // Clear old error
  this.errorMessage =
    '';

  console.log(
    'Image selected:',
    {
      index,
      name: file.name,
      type: file.type,
      size: file.size
    }
  );
}

// ==========================================
// REMOVE IMAGE
// ==========================================

removeImage(
  index: number
): void {

  if (
    this.imageFiles[index]?.preview
  ) {

    URL.revokeObjectURL(
      this.imageFiles[index].preview
    );
  }

  this.imageFiles[index].file =
    null;

  this.imageFiles[index].preview =
    '';

  // Keep compatibility reference
  this.vehicleImages =
    this.imageFiles;
}

// ==========================================
// UPLOADED IMAGE COUNT
// ==========================================

get uploadedImageCount(): number {

  return this.imageFiles.filter(
    image =>
      !!image.file
  ).length;
}

// ==========================================
// SCORE DISPLAY
// ==========================================

get scoreDisplay(): string {

  return Number(
    this.overall_score
  )
    .toFixed(1);
}


  // ==========================================
  // SUBMIT VEHICLE
  // ==========================================

  submitVehicle(): void {

    this.syncDetailedInspectionToChecklist();

    this.successMessage = '';
    this.errorMessage = '';
    this.customerEmailSuccess = '';
    this.customerEmailError = '';
    this.showCustomerCommunication = false;

    if (
      !this.vehicle.brand.trim() ||
      !this.vehicle.model.trim() ||
      !this.vehicle.manufacturing_year ||
      !this.vehicle.price ||
      !this.vehicle.city.trim()
    ) {
      this.errorMessage =
        'Please fill all required vehicle fields.';

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      return;
    }

    this.loading = true;

    const payload = {
      ...this.vehicle,
      customer_name: this.customer_name,
      owner_mobile: this.owner_mobile,
      alternate_mobile: this.alternate_mobile,
      owner_email: this.owner_email,
      owner_address: this.owner_address,
      owner_city: this.owner_city,
      owner_state: this.owner_state,
      owner_pincode: this.owner_pincode,
      aadhar_number: this.aadhar_number,
      pan_number: this.pan_number,
      variant_short_note: this.variant_short_note,
      registration_rto_short_note: this.registration_rto_short_note,
      price_short_note: this.price_short_note,
      engine_remark:
        this.engine_remark.trim() ||
        'Vehicle engine inspection completed.',
      overall_remark:
        this.overall_remark.trim() ||
        'Vehicle inspection completed.',
      overall_score: Number(this.overall_score),
      inspection_checklist: this.checklist,
      detailedInspection: this.detailedInspection
    };

    console.log('ADD VEHICLE PAYLOAD:', payload);

    // =====================================================
    // STEP 1: CREATE VEHICLE + INSPECTION REPORT RECORD
    // =====================================================
    this.vehicleService.addVehicle(payload).subscribe({

      next: (response: any) => {

        console.log('Add Vehicle Response:', response);

        if (!response?.success) {
          this.errorMessage =
            response?.message ||
            'Unable to add vehicle.';
          this.loading = false;
          return;
        }

        const vehicleId = Number(
          response?.data?.vehicleId
        );

        const reportId = Number(
          response?.data?.reportId
        );

        if (!vehicleId) {
          this.errorMessage =
            'Vehicle was created but vehicle ID was not returned by the server.';
          this.loading = false;
          return;
        }

        if (!reportId) {
          this.errorMessage =
            'Vehicle was created but inspection report ID was not returned by the server.';
          this.loading = false;
          return;
        }

        this.publishedVehicleId = vehicleId;
        this.publishedReportId = reportId;

        this.customerEmail =
          (this.owner_email || '')
            .trim()
            .toLowerCase();

        this.customerWhatsApp =
          (this.owner_mobile || '').trim();

        console.log('Vehicle ID:', vehicleId);
        console.log('Inspection Report ID:', reportId);

        // =====================================================
        // STEP 2: UPLOAD IMAGES FIRST
        // =====================================================
        // IMPORTANT:
        // PDF must be generated AFTER images are stored in DB.
        // The previous code generated the PDF before uploading
        // images. That was the wrong order.
        // =====================================================

        const selectedImages =
          this.imageFiles.filter(
            image => !!image.file
          );

        const generateFinalPdf = () => {

          console.log(
            'Generating FINAL Vehicle Inspection PDF...'
          );

          this.vehicleService
            .generateInspectionReportPdf(vehicleId)
            .subscribe({

              next: (pdfResponse: any) => {

                console.log(
                  'Final Vehicle Inspection PDF Response:',
                  pdfResponse
                );

                if (!pdfResponse?.success) {
                  this.errorMessage =
                    pdfResponse?.message ||
                    'Vehicle was created, but the final inspection PDF could not be generated.';
                  this.loading = false;
                  this.showCustomerCommunication = true;
                  return;
                }

                const pdfData =
                  pdfResponse?.data || {};

                if (
                  !pdfData.pdfPath &&
                  !pdfData.pdfUrl &&
                  !pdfData.fileName
                ) {
                  this.errorMessage =
                    'Vehicle was created, but the server did not return a valid inspection PDF path.';
                  this.loading = false;
                  this.showCustomerCommunication = true;
                  return;
                }

                console.log(
                  'FINAL Inspection PDF Generated Successfully:',
                  pdfData
                );

                // =====================================================
                // STEP 4: SEND THE SAME GENERATED PDF TO CUSTOMER
                // =====================================================
                // Admin email is handled by the backend PDF-generation
                // endpoint. Customer email is sent through the dedicated
                // inspection-report email endpoint using the SAME reportId.
                // This avoids generating a second PDF.
                // =====================================================
                const customerEmail =
                  (this.customerEmail || this.owner_email || '')
                    .trim()
                    .toLowerCase();

                const emailPattern =
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                const finishPublishFlow = (
                  customerEmailSent: boolean,
                  customerEmailError = ''
                ) => {
                  this.loading = false;
                  this.showCustomerCommunication = true;

                  if (customerEmailSent) {
                    this.customerEmailSuccess =
                      'Inspection PDF sent successfully to customer email.';
                    this.customerEmailError = '';
                    this.successMessage =
                      selectedImages.length > 0
                        ? 'Vehicle, inspection report, images and final PDF generated successfully. Admin and customer email processing completed.'
                        : 'Vehicle, inspection report and final PDF generated successfully. Admin and customer email processing completed.';
                  } else if (customerEmailError) {
                    this.customerEmailSuccess = '';
                    this.customerEmailError = customerEmailError;
                    this.successMessage =
                      selectedImages.length > 0
                        ? 'Vehicle, inspection report, images and final PDF generated successfully. Customer email could not be sent.'
                        : 'Vehicle, inspection report and final PDF generated successfully. Customer email could not be sent.';
                  } else {
                    this.successMessage =
                      selectedImages.length > 0
                        ? 'Vehicle, inspection report, images and final PDF generated successfully.'
                        : 'Vehicle, inspection report and final PDF generated successfully.';
                  }

                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth'
                    });
                  }, 100);
                };

                if (
                  this.publishedReportId &&
                  emailPattern.test(customerEmail)
                ) {
                  this.vehicleService
                    .sendInspectionReportEmail(
                      this.publishedReportId,
                      customerEmail
                    )
                    .subscribe({
                      next: (emailResponse: any) => {
                        console.log(
                          'Automatic Customer PDF Email Response:',
                          emailResponse
                        );

                        if (emailResponse?.success) {
                          finishPublishFlow(true);
                        } else {
                          finishPublishFlow(
                            false,
                            emailResponse?.message ||
                              'Unable to send PDF to customer email.'
                          );
                        }
                      },
                      error: (emailError: any) => {
                        console.error(
                          'Automatic Customer PDF Email Error:',
                          emailError
                        );

                        finishPublishFlow(
                          false,
                          emailError?.error?.message ||
                            emailError?.message ||
                            'Unable to send PDF to customer email.'
                        );
                      }
                    });
                } else {
                  finishPublishFlow(
                    false,
                    customerEmail
                      ? 'Customer email is invalid. PDF was generated successfully; use the customer email box below to send it manually.'
                      : 'Customer email was not provided. PDF was generated successfully; use the customer email box below to send it manually.'
                  );
                }
              },

              error: (pdfError: any) => {

                console.error(
                  'Final Vehicle Inspection PDF Error:',
                  pdfError
                );

                this.errorMessage =
                  pdfError?.error?.message ||
                  pdfError?.message ||
                  'Vehicle was created, but the final inspection PDF could not be generated.';

                this.loading = false;
                this.showCustomerCommunication = true;

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }
            });
        };

        // =====================================================
        // NO IMAGES SELECTED
        // =====================================================
        if (selectedImages.length === 0) {
          generateFinalPdf();
          return;
        }

        // =====================================================
        // IMAGES SELECTED -> UPLOAD THEM FIRST
        // =====================================================
        console.log(
          `Uploading ${selectedImages.length} vehicle image(s)...`
        );

        this.vehicleService
          .uploadVehicleImages(
            vehicleId,
            selectedImages
          )
          .subscribe({

            next: (imageResponse: any) => {

              console.log(
                'Vehicle Images Response:',
                imageResponse
              );

              if (!imageResponse?.success) {
                this.errorMessage =
                  imageResponse?.message ||
                  'Vehicle and inspection report were created, but vehicle images could not be uploaded. PDF was not generated.';
                this.loading = false;
                this.showCustomerCommunication = true;
                return;
              }

              console.log(
                'Vehicle images uploaded successfully. Now generating final PDF...'
              );

              // =================================================
              // STEP 3: GENERATE FINAL PDF AFTER IMAGE UPLOAD
              // =================================================
              generateFinalPdf();
            },

            error: (imageError: any) => {

              console.error(
                'Vehicle Image Upload Error:',
                imageError
              );

              this.errorMessage =
                imageError?.error?.message ||
                imageError?.message ||
                'Vehicle and inspection report were created, but vehicle images could not be uploaded. PDF was not generated.';

              this.loading = false;
              this.showCustomerCommunication = true;

              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
            }
          });
      },

      error: (error: any) => {

        console.error(
          'Add Vehicle Error:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to add vehicle.';

        this.loading = false;

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  // ==========================================
  // SEND PDF TO CUSTOMER EMAIL
  // ==========================================

  sendCustomerEmail(): void {


    // ========================================
    // REPORT ID CHECK
    // ========================================

    if (
      !this.publishedReportId
    ) {

      this.customerEmailError =
        'Inspection report ID is missing.';

      return;

    }


    // ========================================
    // EMAIL
    // ========================================

    const email =
      this.customerEmail
        .trim()
        .toLowerCase();


    if (!email) {

      this.customerEmailError =
        'Please enter customer email.';


      this.customerEmailSuccess =
        '';


      return;

    }


    // ========================================
    // EMAIL VALIDATION
    // ========================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(email)
    ) {

      this.customerEmailError =
        'Please enter a valid customer email.';


      this.customerEmailSuccess =
        '';


      return;

    }


    // ========================================
    // START
    // ========================================

    this.sendingCustomerEmail =
      true;


    this.customerEmailError =
      '';


    this.customerEmailSuccess =
      '';


    // ========================================
    // API
    // ========================================

    this.vehicleService

      .sendInspectionReportEmail(

        this.publishedReportId,

        email

      )

      .subscribe({

        // ====================================
        // SUCCESS
        // ====================================

        next:
          (response: any) => {


            console.log(

              'Customer PDF Email Response:',

              response

            );


            this.sendingCustomerEmail =
              false;


            if (
              response?.success
            ) {

              this.customerEmailSuccess =
                response?.message ||
                'Inspection PDF sent successfully to customer email.';

            } else {

              this.customerEmailError =
                response?.message ||
                'Unable to send PDF to customer.';

            }

          },


        // ====================================
        // ERROR
        // ====================================

        error:
          (error: any) => {


            console.error(

              'Customer PDF Email Error:',

              error

            );


            this.sendingCustomerEmail =
              false;


            this.customerEmailError =
              error?.error?.message ||
              error?.message ||
              'Unable to send PDF to customer email.';

          }

      });

  }


  // ==========================================
  // OPEN WHATSAPP
  // ==========================================

  sendCustomerWhatsApp(): void {

    const phone =
      this.customerWhatsApp
        .replace(/\D/g, '');


    if (!phone) {

      return;

    }


    const message =
      `Hello ${this.customer_name || 'Customer'}, your vehicle inspection report from Carsey.in is ready. Please find the inspection report PDF.`;


    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


    window.open(

      whatsappUrl,

      '_blank'

    );

  }


  // ==========================================
  // RESET
  // ==========================================

  resetForm(): void {


    this.vehicle = {

      brand: '',

      model: '',

      variant: '',

      manufacturing_year:
        new Date().getFullYear(),

      price:
        null,

      odometer:
        null,

      city: '',

      transmission:
        'Manual',

      fuel_type:
        'Petrol',

      owner_classification:
        'First',

      registration_number: '',

      chassis_number: '',

      engine_number: '',

      inspection_date: '',

      rto: '',

      spare_key:
        'Yes',

      insurance_type: '',

      insurance_validity: '',

      vehicle_note: '',

      status:
        'Draft'

    };


    this.customer_name =
      '';

    this.owner_mobile =
      '';

    this.alternate_mobile =
      '';

    this.owner_email =
      '';

    this.owner_address =
      '';

    this.owner_city =
      '';

    this.owner_state =
      '';

    this.owner_pincode =
      '';

    this.aadhar_number =
      '';

    this.pan_number =
      '';


    this.variant_short_note =
      '';

    this.registration_rto_short_note =
      '';

    this.price_short_note =
      '';


    this.engine_remark =
      '';

    this.overall_remark =
      '';


    this.overall_score =
      9.2;


    this.customerEmail =
      '';

    this.customerWhatsApp =
      '';


    this.publishedVehicleId =
      null;

    this.publishedReportId =
      null;


    this.showCustomerCommunication =
      false;


    this.sendingCustomerEmail =
      false;


    this.customerEmailSuccess =
      '';

    this.customerEmailError =
      '';


    this.checklist = {

      exterior: {

        status:
          'Good',

        remark:
          ''

      },

      interior_electricals: {

        status:
          'Good',

        remark:
          ''

      },

      engine_bay: {

        status:
          'Good',

        remark:
          ''

      },

      transmission_system: {

        status:
          'Good',

        remark:
          ''

      },

      suspension_steering: {

        status:
          'Good',

        remark:
          ''

      },

      braking_system: {

        status:
          'Good',

        remark:
          ''

      },

      tires_wheels: {

        status:
          'Good',

        remark:
          ''

      },

      electricals_ac: {

        status:
          'Good',

        remark:
          ''

      },

      documents_title: {

        status:
          'Good',

        remark:
          ''

      }

    };


    this.initializeDetailedInspection();

    this.imageFiles.forEach(

      image => {

        image.file =
          null;

        image.preview =
          '';

      }

    );
    // Keep compatibility reference synced
this.vehicleImages =
  this.imageFiles;


    this.successMessage =
      '';

    this.errorMessage =
      '';

  }


  // ==========================================
  // CANCEL
  // ==========================================

  cancel(): void {

    this.router.navigate([

      '/admin/vehicles'

    ]);

  }

}