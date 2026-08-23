import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  VehicleService,
  InspectionSection,
  ChecklistItem,
  DetailedInspection,
  VehicleResponse
} from '../../services/vehicle.service';

@Component({
  selector: 'app-edit-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-vehicle.component.html',
  // styleUrl: './edit-vehicle.component.css'
})
export class EditVehicleComponent implements OnInit {

  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // =====================================================
  // ID / STATES
  // =====================================================

  carId = 0;
  loading = false;
  saving = false;

  successMessage = '';
  errorMessage = '';

  // =====================================================
  // CUSTOMER COMMUNICATION
  // =====================================================

  showCustomerCommunication = false;
  publishedVehicleId: number | null = null;
  publishedReportId: number | null = null;

  customerEmail = '';
  customerWhatsApp = '';
  sendingCustomerEmail = false;
  customerEmailSuccess = '';
  customerEmailError = '';

  // =====================================================
  // VEHICLE
  // SAME FIELDS AS ADD VEHICLE
  // =====================================================

  vehicle: any = {
    brand: '',
    model: '',
    variant: '',
    manufacturing_year: new Date().getFullYear(),
    price: null,
    odometer: null,
    city: '',
    transmission: 'Manual',
    fuel_type: 'Petrol',
    owner_classification: 'First',
    registration_number: '',
    chassis_number: '',
    engine_number: '',
    inspection_date: '',
    rto: '',
    spare_key: 'Yes',
    insurance_type: '',
    insurance_validity: '',
    vehicle_note: '',
    status: 'Draft'
  };

  // =====================================================
  // SHORT REMARKS
  // =====================================================

  variant_short_note = '';
  registration_rto_short_note = '';
  price_short_note = '';

  // =====================================================
  // CUSTOMER / OWNER
  // SAME FIELDS AS ADD VEHICLE
  // =====================================================

  customer_name = '';
  owner_mobile = '';
  alternate_mobile = '';
  owner_email = '';
  owner_address = '';
  owner_city = '';
  owner_state = '';
  owner_pincode = '';
  aadhar_number = '';
  pan_number = '';

  // =====================================================
  // INSPECTION
  // =====================================================

  engine_remark = '';
  overall_remark = '';
  overall_score = 9.2;

  // =====================================================
  // BASIC CHECKLIST
  // =====================================================

  checklist: Record<string, ChecklistItem> = {
    exterior: { status: 'Good', remark: '' },
    interior_electricals: { status: 'Good', remark: '' },
    engine_bay: { status: 'Good', remark: '' },
    transmission_system: { status: 'Good', remark: '' },
    suspension_steering: { status: 'Good', remark: '' },
    braking_system: { status: 'Good', remark: '' },
    tires_wheels: { status: 'Good', remark: '' },
    electricals_ac: { status: 'Good', remark: '' },
    documents_title: { status: 'Good', remark: '' }
  };

  // =====================================================
  // DETAILED INSPECTION OPTIONS
  // IMPORTANT: ADD + EDIT USE THE SAME SOURCE.
  // =====================================================

  readonly inspectionSections: InspectionSection[] =
    this.vehicleService.inspectionSections;

  detailedInspection: DetailedInspection = {};

  // =====================================================
  // STANDARD PHOTOS
  // SAME 66 SLOTS AS ADD VEHICLE
  // =====================================================

  readonly standardPhotoRows: string[] = [
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

  readonly standardPhotoColumns: number[] = [
    1, 2, 3, 4, 5, 6
  ];

  imageFiles: {
    type: string;
    row: string;
    column: number;
    file: File | null;
    preview: string;
    existingImage?: boolean;
  }[] = this.standardPhotoRows.flatMap(
    (row: string) =>
      this.standardPhotoColumns.map(
        (column: number) => ({
          type: `${row} - Image ${column}`,
          row,
          column,
          file: null,
          preview: '',
          existingImage: false
        })
      )
  );

  imageLabels = this.standardPhotoRows;

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    const routeId =
      this.route.snapshot.paramMap.get('carId') ??
      this.route.snapshot.paramMap.get('id');

    const id = Number(routeId);

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid vehicle ID.';
      return;
    }

    this.carId = id;
    this.initializeDetailedInspection();
    this.loadVehicle();
  }

  // =====================================================
  // INITIALIZE DETAILED INSPECTION
  // =====================================================

  private initializeDetailedInspection(): void {
    this.detailedInspection = {};

    this.inspectionSections.forEach(section => {
      this.detailedInspection[section.key] = {};

      section.rows.forEach(row => {
        this.detailedInspection[section.key][row[0]] = [];
      });
    });
  }

  // =====================================================
  // LOAD VEHICLE
  // =====================================================

  loadVehicle(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.vehicleService
      .getVehicleById(this.carId)
      .subscribe({
        next: (response: VehicleResponse | any) => {
          console.log('EDIT VEHICLE RESPONSE:', response);

          if (!response?.success) {
            this.errorMessage =
              response?.message ||
              'Unable to load vehicle.';
            this.loading = false;
            return;
          }

          const data =
            response?.data ?? response ?? {};

          // =================================================
          // VEHICLE
          // =================================================

          const vehicleData =
            data?.vehicle ??
            data?.car ??
            data?.data?.vehicle ??
            {};

          this.vehicle = {
            ...this.vehicle,
            ...vehicleData
          };

          // HTML input[type="date"] accepts only yyyy-MM-dd.
          // Backend may return an ISO datetime such as
          // 2024-11-29T18:30:00.000Z, so normalize both edit dates
          // before Angular binds them to the date inputs.
          this.vehicle.inspection_date =
            this.normalizeDateForInput(this.vehicle.inspection_date);

          this.vehicle.insurance_validity =
            this.normalizeDateForInput(this.vehicle.insurance_validity);

          // =================================================
          // OWNER
          // =================================================

          const ownerData =
            data?.owner ??
            data?.data?.owner ??
            {};

          this.mapOwner(ownerData, vehicleData);

          // =================================================
          // INSPECTION REPORT
          // Backend versions use either inspection or
          // inspectionReport / inspection_report.
          // =================================================

          const inspectionData =
            data?.inspection ??
            data?.inspectionReport ??
            data?.inspection_report ??
            data?.data?.inspection ??
            {};

          this.engine_remark = String(
            this.pick(
              inspectionData,
              [
                'engine_remark',
                'engineRemark'
              ]
            ) ??
            this.pick(vehicleData, [
              'engine_remark',
              'engineRemark'
            ]) ??
            ''
          );

          this.overall_remark = String(
            this.pick(
              inspectionData,
              [
                'overall_remark',
                'overallRemark'
              ]
            ) ??
            this.pick(vehicleData, [
              'overall_remark',
              'overallRemark'
            ]) ??
            ''
          );

          const score =
            this.pick(
              inspectionData,
              [
                'overall_score',
                'overallScore'
              ]
            ) ??
            this.pick(vehicleData, [
              'overall_score',
              'overallScore'
            ]);

          if (
            score !== undefined &&
            score !== null &&
            score !== ''
          ) {
            this.overall_score = Number(score);
          }

          this.publishedReportId =
            Number(
              this.pick(inspectionData, [
                'report_id',
                'reportId',
                'id'
              ]) ?? 0
            ) || null;

          this.publishedVehicleId =
            Number(
              this.pick(vehicleData, [
                'car_id',
                'carId',
                'id'
              ]) ?? this.carId
            ) || this.carId;

          // =================================================
          // SHORT NOTES
          // =================================================

          this.variant_short_note = String(
            this.pick(data, [
              'variant_short_note',
              'variantShortNote'
            ]) ??
            this.pick(vehicleData, [
              'variant_short_note',
              'variantShortNote'
            ]) ??
            ''
          );

          this.registration_rto_short_note = String(
            this.pick(data, [
              'registration_rto_short_note',
              'registrationRtoShortNote'
            ]) ??
            this.pick(vehicleData, [
              'registration_rto_short_note',
              'registrationRtoShortNote'
            ]) ??
            ''
          );

          this.price_short_note = String(
            this.pick(data, [
              'price_short_note',
              'priceShortNote'
            ]) ??
            this.pick(vehicleData, [
              'price_short_note',
              'priceShortNote'
            ]) ??
            ''
          );

          // =================================================
          // CHECKLIST
          // =================================================

          const checklistData =
            data?.checklist ??
            data?.inspection_checklist ??
            inspectionData?.checklist ??
            inspectionData?.inspection_checklist ??
            inspectionData?.checklist_data ??
            vehicleData?.checklist ??
            vehicleData?.inspection_checklist ??
            vehicleData?.checklist_data ??
            data?.data?.checklist ??
            data?.data?.inspection_checklist ??
            {};

          this.applyChecklist(checklistData);

          // =================================================
          // EXISTING DETAILED OPTIONS
          // =================================================

          const directDetailed =
            data?.detailedInspection ??
            data?.detailed_inspection ??
            vehicleData?.detailedInspection ??
            vehicleData?.detailed_inspection;

          if (directDetailed) {
            this.applyDetailedInspection(directDetailed);
          } else {
            this.buildDetailedInspectionFromChecklist();
          }

          // =================================================
          // EXISTING PHOTOS
          // =================================================

          this.loadExistingImages();

          this.loading = false;
        },
        error: (error: any) => {
          console.error('EDIT VEHICLE LOAD ERROR:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load vehicle.';

          this.loading = false;
        }
      });
  }

  // =====================================================
  // OWNER MAPPING
  // =====================================================

  private mapOwner(owner: any, vehicleData: any): void {
    const source = {
      ...(vehicleData || {}),
      ...(owner || {})
    };

    this.customer_name = String(
      this.pick(source, [
        'customer_name',
        'customerName',
        'owner_name',
        'ownerName',
        'owner_name',
        'name',
        'full_name'
      ]) ?? ''
    );

    this.owner_mobile = String(
      this.pick(source, [
        'owner_mobile',
        'ownerMobile',
        'mobile',
        'phone'
      ]) ?? ''
    );

    this.alternate_mobile = String(
      this.pick(source, [
        'alternate_mobile',
        'alternateMobile',
        'alternate_phone'
      ]) ?? ''
    );

    this.owner_email = String(
      this.pick(source, [
        'owner_email',
        'ownerEmail',
        'email',
        'customer_email',
        'customerEmail'
      ]) ?? ''
    );

    this.owner_address = String(
      this.pick(source, [
        'owner_address',
        'ownerAddress',
        'address'
      ]) ?? ''
    );

    this.owner_city = String(
      this.pick(source, [
        'owner_city',
        'ownerCity',
        'city'
      ]) ?? ''
    );

    this.owner_state = String(
      this.pick(source, [
        'owner_state',
        'ownerState',
        'state'
      ]) ?? ''
    );

    this.owner_pincode = String(
      this.pick(source, [
        'owner_pincode',
        'ownerPincode',
        'pincode',
        'pin_code'
      ]) ?? ''
    );

    this.aadhar_number = String(
      this.pick(source, [
        'aadhar_number',
        'aadharNumber',
        'aadhaar_number',
        'aadhaarNumber'
      ]) ?? ''
    );

    this.pan_number = String(
      this.pick(source, [
        'pan_number',
        'panNumber',
        'pan'
      ]) ?? ''
    );
  }

  // =====================================================
  // GENERIC PICK HELPER
  // =====================================================

  private pick(
    object: any,
    keys: string[]
  ): any {
    if (!object || typeof object !== 'object') {
      return undefined;
    }

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ''
      ) {
        return object[key];
      }
    }

    return undefined;
  }

  // =====================================================
  // CHECKLIST NORMALIZER
  // =====================================================

  private applyChecklist(raw: any): void {
    let source: any = raw;

    if (Array.isArray(source)) {
      const merged: any = {};

      source.forEach(row => {
        if (row && typeof row === 'object') {
          Object.assign(merged, row);
        }
      });

      source = merged;
    }

    if (typeof source === 'string') {
      source = this.parseJson(source) ?? {};
    }

    if (!source || typeof source !== 'object') {
      return;
    }

    // =================================================
    // JSON FIELD INSIDE CHECKLIST ROW
    // =================================================

    for (const field of [
      'checklist_data',
      'data',
      'inspection_data'
    ]) {
      if (typeof source[field] === 'string') {
        const parsed = this.parseJson(source[field]);
        if (parsed && typeof parsed === 'object') {
          source = {
            ...source,
            ...parsed
          };
        }
      }
    }

    // =================================================
    // COPY NINE BASIC CHECKLIST ITEMS
    // =================================================

    for (const section of this.inspectionSections) {
      const item =
        source[section.key] ??
        source[this.toCamelCase(section.key)];

      if (item && typeof item === 'object') {
        this.checklist[section.key] = {
          status:
            item.status ||
            this.checklist[section.key]?.status ||
            'Good',
          remark:
            item.remark ||
            this.checklist[section.key]?.remark ||
            ''
        };
      }
    }

    // =================================================
    // IF DIRECT detailedInspection IS STORED IN CHECKLIST
    // =================================================

    const detailed =
      source.detailedInspection ??
      source.detailed_inspection;

    if (detailed) {
      this.applyDetailedInspection(detailed);
    }
  }

  private parseJson(value: any): any {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private toCamelCase(value: string): string {
    return value.replace(
      /_([a-z])/g,
      (_, letter) => letter.toUpperCase()
    );
  }

  // =====================================================
  // RESTORE CHECKBOX OPTIONS FROM SAVED REMARKS
  // =====================================================

  private buildDetailedInspectionFromChecklist(): void {
    this.initializeDetailedInspection();

    for (const section of this.inspectionSections) {
      const remark =
        this.checklist[section.key]?.remark || '';

      if (!remark.trim()) {
        continue;
      }

      const rowParts = remark.split(' | ');

      for (const part of rowParts) {
        const separator = part.indexOf(':');

        if (separator <= 0) {
          continue;
        }

        const rowName =
          part.slice(0, separator).trim();

        const selectedText =
          part.slice(separator + 1).trim();

        const sectionRow =
          section.rows.find(
            row => row[0] === rowName
          );

        if (!sectionRow) {
          continue;
        }

        const selected = selectedText
          .split(',')
          .map(value => value.trim())
          .filter(value =>
            sectionRow[1].includes(value)
          );

        this.detailedInspection[section.key][rowName] =
          selected;
      }
    }
  }

  private applyDetailedInspection(raw: any): void {
    if (!raw || typeof raw !== 'object') {
      return;
    }

    this.initializeDetailedInspection();

    for (const section of this.inspectionSections) {
      const sourceSection =
        raw[section.key] ??
        raw[this.toCamelCase(section.key)];

      if (!sourceSection || typeof sourceSection !== 'object') {
        continue;
      }

      for (const row of section.rows) {
        const values =
          sourceSection[row[0]];

        if (Array.isArray(values)) {
          this.detailedInspection[section.key][row[0]] =
            values.filter(value =>
              row[1].includes(value)
            );
        }
      }
    }
  }

  // =====================================================
  // CHECKBOX HANDLERS
  // =====================================================

  toggleInspectionOption(
    sectionKey: string,
    rowName: string,
    option: string
  ): void {
    const current =
      this.detailedInspection[sectionKey]?.[rowName] || [];

    const index = current.indexOf(option);

    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(option);
    }

    this.detailedInspection[sectionKey][rowName] = [
      ...current
    ];

    this.syncDetailedInspectionToChecklist();
  }

  isInspectionOptionSelected(
    sectionKey: string,
    rowName: string,
    option: string
  ): boolean {
    return (
      this.detailedInspection[sectionKey]?.[rowName] || []
    ).includes(option);
  }

  hasInspectionIssue(sectionKey: string): boolean {
    const section =
      this.detailedInspection[sectionKey] || {};

    return Object.values(section).some(
      (values: string[]) =>
        values.length > 0 &&
        !values.includes('Ok/No imperfection')
    );
  }

  buildDetailedRemark(sectionKey: string): string {
    const section =
      this.detailedInspection[sectionKey] || {};

    const rows = Object.entries(section)
      .filter(([, values]) => values.length > 0)
      .map(
        ([row, values]) =>
          `${row}: ${values.join(', ')}`
      );

    return rows.length
      ? rows.join(' | ')
      : '';
  }

  syncDetailedInspectionToChecklist(): void {
    for (const section of this.inspectionSections) {
      // Keep every inspection section safe even if the backend/service
      // contains a section key that was not present in the initial
      // checklist object. This prevents the Update button from crashing
      // with "Cannot set properties of undefined (setting 'status')".
      if (
        !this.checklist[section.key] ||
        typeof this.checklist[section.key] !== 'object'
      ) {
        this.checklist[section.key] = {
          status: 'Good',
          remark: ''
        };
      }

      if (
        !this.detailedInspection[section.key] ||
        typeof this.detailedInspection[section.key] !== 'object'
      ) {
        this.detailedInspection[section.key] = {};
      }

      this.checklist[section.key].status =
        this.hasInspectionIssue(section.key)
          ? 'Need Attention'
          : 'Good';

      this.checklist[section.key].remark =
        this.buildDetailedRemark(section.key);
    }
  }

  // =====================================================
  // DATE NORMALIZER FOR HTML DATE INPUTS
  // =====================================================

  private normalizeDateForInput(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    const text = String(value).trim();

    if (!text) {
      return '';
    }

    // Already in the exact format required by input[type=date].
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    // Handles ISO datetime values such as
    // 2024-11-29T18:30:00.000Z.
    const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);

    if (isoMatch) {
      return isoMatch[1];
    }

    // Final fallback for other valid date strings.
    const date = new Date(text);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  }

  // =====================================================
  // SCORE
  // =====================================================

  get scoreDisplay(): string {
    return Number(this.overall_score || 0).toFixed(1);
  }

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  onImageSelected(
    event: Event,
    index: number
  ): void {
    const input =
      event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];

    if (this.imageFiles[index]?.preview) {
      URL.revokeObjectURL(
        this.imageFiles[index].preview
      );
    }

    this.imageFiles[index].file = file;
    this.imageFiles[index].preview =
      URL.createObjectURL(file);
    this.imageFiles[index].existingImage = false;
  }

  removeImage(index: number): void {
    if (this.imageFiles[index]?.preview) {
      URL.revokeObjectURL(
        this.imageFiles[index].preview
      );
    }

    this.imageFiles[index].file = null;
    this.imageFiles[index].preview = '';
    this.imageFiles[index].existingImage = false;
  }

  get uploadedImageCount(): number {
    return this.imageFiles.filter(
      image => !!image.file || !!image.preview
    ).length;
  }

  // =====================================================
  // LOAD EXISTING IMAGES
  // =====================================================

  private loadExistingImages(): void {
    this.vehicleService
      .getVehicleImages(this.carId)
      .subscribe({
        next: (response: any) => {
          const images =
            response?.data?.images ??
            response?.data ??
            response?.images ??
            [];

          if (!Array.isArray(images)) {
            return;
          }

          images.forEach((image: any, index: number) => {
            const imageType = String(
              image?.image_type ??
              image?.imageType ??
              image?.type ??
              ''
            ).trim();

            let targetIndex = this.imageFiles.findIndex(
              slot => slot.type === imageType
            );

            // Backward compatibility for older DB records whose
            // image_type does not contain the exact slot label.
            if (targetIndex < 0) {
              const match = imageType.match(/^(.+?)\s*-\s*Image\s*(\d+)$/i);

              if (match) {
                const row = match[1].trim();
                const column = Number(match[2]);

                targetIndex = this.imageFiles.findIndex(
                  slot =>
                    slot.row === row &&
                    slot.column === column
                );
              }
            }

            // Final fallback keeps compatibility with old records.
            if (targetIndex < 0) {
              targetIndex = index;
            }

            if (
              targetIndex < 0 ||
              targetIndex >= this.imageFiles.length
            ) {
              return;
            }

            const imagePath =
              image?.image_path ??
              image?.imagePath ??
              image?.url ??
              '';

            if (!imagePath) {
              return;
            }

            this.imageFiles[targetIndex].preview =
              imagePath.startsWith('http://') ||
              imagePath.startsWith('https://')
                ? imagePath
                : `http://localhost:5000${imagePath}`;

            this.imageFiles[targetIndex].existingImage = true;
          });
        },
        error: (error: any) => {
          console.warn(
            'Existing vehicle images could not be loaded:',
            error
          );
        }
      });
  }

  // =====================================================
  // UPDATE VEHICLE
  // =====================================================

  updateVehicle(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.syncDetailedInspectionToChecklist();

    if (
      !String(this.vehicle.brand || '').trim() ||
      !String(this.vehicle.model || '').trim()
    ) {
      this.errorMessage =
        'Brand and Model are required.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.saving = true;
    this.loading = true;

    const payload: any = {
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
      registration_rto_short_note:
        this.registration_rto_short_note,
      price_short_note: this.price_short_note,

      engine_remark: this.engine_remark,
      overall_remark: this.overall_remark,
      overall_score: Number(this.overall_score),

      inspection_checklist: this.checklist,
      detailedInspection: this.detailedInspection
    };

    console.log(
      'UPDATE VEHICLE PAYLOAD:',
      payload
    );

    this.vehicleService
      .updateVehicle(this.carId, payload)
      .subscribe({
        next: (response: any) => {
          console.log(
            'UPDATE VEHICLE RESPONSE:',
            response
          );

          if (!response?.success) {
            this.errorMessage =
              response?.message ||
              'Vehicle could not be updated.';
            this.saving = false;
            this.loading = false;
            return;
          }

          // -------------------------------------------------
          // UPLOAD NEW / REPLACED IMAGES AFTER VEHICLE UPDATE
          // Existing images are not re-uploaded because they have
          // file === null. Only newly selected files are uploaded.
          // -------------------------------------------------
          const newImages = this.imageFiles
            .filter(image => !!image.file)
            .map(image => ({
              type: image.type,
              file: image.file,
              preview: image.preview,
              row: image.row,
              column: image.column
            }));

          const finishUpdate = () => {
            this.successMessage =
              response?.message ||
              'Vehicle updated successfully.';

            this.saving = false;
            this.loading = false;

            // Reload vehicle + inspection + images from DB.
            this.loadVehicle();
          };

          if (newImages.length > 0) {
            this.vehicleService
              .uploadVehicleImages(
                this.carId,
                newImages
              )
              .subscribe({
                next: () => finishUpdate(),
                error: (imageError: any) => {
                  console.error(
                    'VEHICLE IMAGE UPLOAD ERROR:',
                    imageError
                  );

                  // Vehicle itself was already updated.
                  // Keep that update successful but tell the user
                  // that image upload failed.
                  this.successMessage =
                    'Vehicle updated, but some images could not be uploaded.';
                  this.errorMessage =
                    imageError?.error?.message ||
                    imageError?.message ||
                    'Vehicle images could not be uploaded.';

                  this.saving = false;
                  this.loading = false;
                  this.loadVehicle();
                }
              });
          } else {
            finishUpdate();
          }
        },
        error: (error: any) => {
          console.error(
            'UPDATE VEHICLE ERROR:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Vehicle could not be updated.';

          this.saving = false;
          this.loading = false;

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
  }

  // =====================================================
  // CUSTOMER EMAIL
  // =====================================================

  sendCustomerEmail(): void {
    if (!this.publishedReportId) {
      this.customerEmailError =
        'Inspection report ID is missing.';
      return;
    }

    const email =
      String(this.customerEmail || '')
        .trim()
        .toLowerCase();

    if (!email) {
      this.customerEmailError =
        'Please enter customer email.';
      return;
    }

    const pattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(email)) {
      this.customerEmailError =
        'Please enter a valid customer email.';
      return;
    }

    this.sendingCustomerEmail = true;
    this.customerEmailError = '';
    this.customerEmailSuccess = '';

    this.vehicleService
      .sendInspectionReportEmail(
        this.publishedReportId,
        email
      )
      .subscribe({
        next: (response: any) => {
          this.sendingCustomerEmail = false;

          if (response?.success) {
            this.customerEmailSuccess =
              response?.message ||
              'Inspection PDF sent successfully to customer email.';
          } else {
            this.customerEmailError =
              response?.message ||
              'Unable to send PDF to customer.';
          }
        },
        error: (error: any) => {
          this.sendingCustomerEmail = false;
          this.customerEmailError =
            error?.error?.message ||
            error?.message ||
            'Unable to send PDF to customer email.';
        }
      });
  }

  // =====================================================
  // WHATSAPP
  // =====================================================

  sendCustomerWhatsApp(): void {
    const phone =
      String(this.customerWhatsApp || '')
        .replace(/\D/g, '');

    if (!phone) {
      return;
    }

    const message =
      `Hello ${this.customer_name || 'Customer'}, your vehicle inspection report from Carsey.in is ready.`;

    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      '_blank'
    );
  }

  // =====================================================
  // RESET = RELOAD DB DATA
  // =====================================================

  resetForm(): void {
    if (this.carId > 0) {
      this.loadVehicle();
    }
  }

  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {
    this.router.navigate([
      '/admin/vehicles'
    ]);
  }
}