import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  FormsModule
} from '@angular/forms';

import {
  VehicleService
} from '../../services/vehicle.service';


// =====================================================
// VEHICLE
// =====================================================

interface Vehicle {

  car_id: number;

  owner_id?: number;

  brand?: string;

  model?: string;

  variant?: string;

  manufacturing_year?: number;

  price?: number;

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
// OWNER
// =====================================================

interface Owner {

  owner_id?: number;

  owner_name?: string;

  mobile?: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  pan_number?: string;

}


// =====================================================
// INSPECTION
// =====================================================

interface Inspection {

  overall_score?: number;

  engine_remark?: string;

  overall_remark?: string;

}


// =====================================================
// CHECKLIST
// =====================================================

interface ChecklistItem {

  status?: string;

  remark?: string;

  condition?: string;

  result?: string;

  remarks?: string;

  note?: string;

}


// =====================================================
// REPORT DATA
// =====================================================

interface ReportData {

  report_id?: number;

  reportId?: number;

  car_id?: number;

  carId?: number;

  overall_score?: number;

  engine_remark?: string;

  overall_remark?: string;

  pdf_path?: string;

  publish_status?: string;

  created_at?: string;

  vehicle: Vehicle;

  owner: Owner | null;

  inspection: Inspection | null;

  checklist: {
    [key: string]: ChecklistItem;
  };

}


// =====================================================
// REPORT LIST ITEM
// =====================================================

interface ReportListItem {

  report_id: number;

  car_id: number;

  overall_score?: number;

  engine_remark?: string;

  overall_remark?: string;

  pdf_path?: string;

  publish_status?: string;

  created_at?: string;

}


// =====================================================
// COMPONENT
// =====================================================

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent
  implements OnInit {


  // =====================================================
  // SERVICE
  // =====================================================

  private vehicleService =
    inject(VehicleService);

  // =====================================================
  // BACKEND GENERATED PDF VIEWER
  // =====================================================

  private sanitizer =
    inject(DomSanitizer);

  pdfViewerUrl:
    SafeResourceUrl | null = null;


  // =====================================================
  // REPORTS
  // =====================================================

  reports:
    ReportListItem[] = [];


  // =====================================================
  // SELECTED REPORT
  // =====================================================

  selectedReport:
    ReportData | null = null;


  // =====================================================
  // FILTERS
  // =====================================================

  searchText = '';

  statusFilter = 'All';


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;

  detailsLoading = false;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadReports();

  }


  // =====================================================
  // LOAD REPORTS
  // =====================================================

  loadReports(): void {

    this.loading = true;

    this.errorMessage = '';


    this.vehicleService
      .getReports()
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (response: any) => {

          console.log(
            '================================='
          );

          console.log(
            'INSPECTION REPORT API RESPONSE'
          );

          console.log(
            response
          );

          console.log(
            '================================='
          );


          /*
           * Backend response ke multiple possible
           * structures handle kar rahe hain.
           *
           * FORMAT 1:
           *
           * {
           *   success: true,
           *   data: [...]
           * }
           *
           *
           * FORMAT 2:
           *
           * {
           *   success: true,
           *   data: {
           *      reports: [...]
           *   }
           * }
           *
           *
           * FORMAT 3:
           *
           * {
           *   success: true,
           *   reports: [...]
           * }
           */


          let reportData: any[] = [];


          // -----------------------------------------------
          // data directly array
          // -----------------------------------------------

          if (
            Array.isArray(
              response?.data
            )
          ) {

            reportData =
              response.data;

          }


          // -----------------------------------------------
          // data.reports
          // -----------------------------------------------

          else if (
            Array.isArray(
              response?.data?.reports
            )
          ) {

            reportData =
              response.data.reports;

          }


          // -----------------------------------------------
          // response.reports
          // -----------------------------------------------

          else if (
            Array.isArray(
              response?.reports
            )
          ) {

            reportData =
              response.reports;

          }


          // -----------------------------------------------
          // Normalize report data
          // -----------------------------------------------

          this.reports =
            reportData.map(
              (report: any) => {

                return {

                  report_id:
                    Number(
                      report.report_id ??
                      report.reportId ??
                      0
                    ),

                  car_id:
                    Number(
                      report.car_id ??
                      report.carId ??
                      report.vehicle_id ??
                      0
                    ),

                  overall_score:
                    report.overall_score ??
                    report.overallScore ??
                    0,

                  engine_remark:
                    report.engine_remark ??
                    report.engineRemark ??
                    '',

                  overall_remark:
                    report.overall_remark ??
                    report.overallRemark ??
                    '',

                  pdf_path:
                    report.pdf_path ??
                    report.pdfPath ??
                    '',

                  publish_status:
                    report.publish_status ??
                    report.publishStatus ??
                    'No',

                  created_at:
                    report.created_at ??
                    report.createdAt ??
                    ''

                };

              }
            );


          console.log(
            'NORMALIZED REPORTS:',
            this.reports
          );


          // -----------------------------------------------
          // Empty
          // -----------------------------------------------

          if (
            this.reports.length === 0
          ) {

            this.errorMessage =
              response?.message ||
              'No inspection reports found.';

          }


          this.loading = false;

        },


        // =================================================
        // ERROR
        // =================================================

        error: (error: any) => {

          console.error(
            '================================='
          );

          console.error(
            'INSPECTION REPORT API ERROR'
          );

          console.error(
            error
          );

          console.error(
            '================================='
          );


          this.reports = [];


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load inspection reports.';


          this.loading = false;

        }

      });

  }


  // =====================================================
  // FILTER REPORTS
  // =====================================================

  filteredReports():
    ReportListItem[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    return this.reports.filter(
      (
        report: ReportListItem
      ) => {


        // -----------------------------------------------
        // SEARCH
        // -----------------------------------------------

        const matchesSearch =

          !search ||

          String(
            report.report_id ?? ''
          )
            .toLowerCase()
            .includes(search) ||

          String(
            report.car_id ?? ''
          )
            .toLowerCase()
            .includes(search);


        // -----------------------------------------------
        // STATUS
        // -----------------------------------------------

        const matchesStatus =

          this.statusFilter === 'All' ||

          report.publish_status ===
            this.statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =====================================================
  // OPEN REPORT
  // =====================================================

  openReport(
    report: ReportListItem
  ): void {

    this.detailsLoading = true;

    this.errorMessage = '';


    console.log(
      'Opening Report:',
      report
    );


    // ===================================================
    // GET COMPLETE VEHICLE DATA
    // ===================================================

    this.vehicleService
      .getVehicleById(
        Number(report.car_id)
      )
      .subscribe({

        // =================================================
        // SUCCESS
        // =================================================

        next: (
          response: any
        ) => {

          console.log(
            'Complete Vehicle API:',
            response
          );


          if (
            !response?.success ||
            !response?.data
          ) {

            this.errorMessage =
              response?.message ||
              'Complete vehicle report data not found.';

            this.detailsLoading = false;

            return;

          }


          const data =
            response.data;


          /*
           * API kabhi direct vehicle deta hai:
           *
           * data = {
           *   car_id: 8,
           *   brand: "Audi"
           * }
           *
           *
           * Ya:
           *
           * data = {
           *   vehicle: {...},
           *   owner: {...},
           *   inspection: {...},
           *   checklist: {...}
           * }
           *
           * Dono handle honge.
           */


          const vehicle: Vehicle =
            data.vehicle ??
            data;


          const owner: Owner | null =
            data.owner ??
            null;


          const inspection: Inspection | null =
            data.inspection ??
            {

              overall_score:
                report.overall_score,

              engine_remark:
                report.engine_remark,

              overall_remark:
                report.overall_remark

            };


          const checklist: {
            [key: string]: ChecklistItem;
          } =
            data.checklist ??
            {};


          // =================================================
          // SELECTED REPORT
          // =================================================

          this.selectedReport = {

            report_id:
              data.report_id ??
              data.reportId ??
              report.report_id,

            reportId:
              data.reportId ??
              data.report_id ??
              report.report_id,

            car_id:
              vehicle.car_id ??
              data.car_id ??
              data.carId ??
              report.car_id,

            carId:
              vehicle.car_id ??
              data.car_id ??
              data.carId ??
              report.car_id,

            overall_score:
              data.overall_score ??
              report.overall_score,

            engine_remark:
              data.engine_remark ??
              report.engine_remark,

            overall_remark:
              data.overall_remark ??
              report.overall_remark,

            pdf_path:
              data.pdf_path ??
              report.pdf_path,

            publish_status:
              data.publish_status ??
              report.publish_status,

            created_at:
              data.created_at ??
              report.created_at,

            vehicle,

            owner,

            inspection,

            checklist

          };

          // =================================================
          // USE THE EXACT PDF GENERATED BY BACKEND
          // =================================================

          const selectedPdfPath =
            this.selectedReport.pdf_path;

          if (
            selectedPdfPath &&
            String(selectedPdfPath).trim() !== ''
          ) {
            // IMPORTANT:
            // Always show the PDF path that is currently saved in
            // inspection_reports.pdf_path.
            // Cache-buster is added only to prevent Chrome from showing
            // an older cached copy when the backend overwrites the same file.
            let generatedPdfUrl =
              this.buildPdfUrl(
                String(selectedPdfPath)
              );

            if (generatedPdfUrl) {
              generatedPdfUrl =
                generatedPdfUrl +
                (generatedPdfUrl.includes('?') ? '&' : '?') +
                'v=' +
                Date.now();
            }

            this.pdfViewerUrl =
              generatedPdfUrl
                ? this.sanitizer
                    .bypassSecurityTrustResourceUrl(
                      generatedPdfUrl
                    )
                : null;

            console.log(
              'REPORT PDF VIEWER URL:',
              generatedPdfUrl
            );
          } else {
            this.pdfViewerUrl = null;
          }


          console.log(
            'FINAL SELECTED REPORT:',
            this.selectedReport
          );


          this.detailsLoading = false;

        },


        // =================================================
        // ERROR
        // =================================================

        error: (
          error: any
        ) => {

          console.error(
            'Complete Vehicle Report Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load complete vehicle report.';


          this.detailsLoading = false;

        }

      });

  }


  // =====================================================
  // CLOSE REPORT
  // =====================================================

  closeReport(): void {

    this.selectedReport =
      null;

    this.pdfViewerUrl =
      null;

    this.errorMessage =
      '';

  }


  // =====================================================
  // CHECKLIST ENTRIES
  // =====================================================

  checklistEntries(): {

    key: string;

    title: string;

    item: ChecklistItem;

  }[] {


    const checklist =
      this.selectedReport?.checklist;


    if (!checklist) {

      return [];

    }


    const titles: {
      [key: string]: string;
    } = {

      exterior:
        'Exterior',

      interior_electricals:
        'Interior & Electricals',

      engine_bay:
        'Engine Bay',

      transmission_system:
        'Transmission System',

      suspension_steering:
        'Suspension & Steering',

      braking_system:
        'Braking System',

      tires_wheels:
        'Tyres & Wheels',

      tyres_wheels:
        'Tyres & Wheels',

      electricals_ac:
        'Electricals & AC',

      documents_title:
        'Documents & Title',

      documents:
        'Documents & Title'

    };


    return Object.keys(
      checklist
    ).map(
      (
        key: string
      ) => {

        const item =
          checklist[key] ||
          {};


        const title =
          titles[key] ||
          key
            .replace(
              /_/g,
              ' '
            )
            .replace(
              /\b\w/g,
              (
                char: string
              ) =>
                char.toUpperCase()
            );


        return {

          key,

          title,

          item

        };

      }
    );

  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(
    value: any
  ): string {

    if (
      !value
    ) {

      return '-';

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return '-';

    }


    return date.toLocaleDateString(
      'en-IN',
      {

        day: '2-digit',

        month: 'short',

        year: 'numeric'

      }
    );

  }


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  formatMoney(
    value: any
  ): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '-';

    }


    const amount =
      Number(value);


    if (
      Number.isNaN(amount)
    ) {

      return '-';

    }


    return new Intl.NumberFormat(
      'en-IN',
      {

        style: 'currency',

        currency: 'INR',

        maximumFractionDigits: 0

      }
    ).format(amount);

  }


  // =====================================================
  // PRINT / SAVE PDF
  // =====================================================

  // =====================================================
  // MAIN PRINT / SAVE PDF
  // =====================================================
  // Uses the SAME PDF generated by backend inspectionReportPdf.
  // The original browser PDF code is preserved below.
  // =====================================================

  printReport(): void {

    if (!this.selectedReport) {
      alert('Please open a report first.');
      return;
    }

    const pdfPath =
      this.selectedReport.pdf_path;

    if (
      !pdfPath ||
      String(pdfPath).trim() === ''
    ) {
      this.errorMessage =
        'PDF is not available for this inspection report. Please regenerate/update the vehicle report first.';
      alert(this.errorMessage);
      return;
    }

    const pdfUrl =
      this.buildPdfUrl(String(pdfPath));

    console.log('OPENING BACKEND GENERATED PDF');
    console.log('PDF PATH:', pdfPath);
    console.log('PDF URL:', pdfUrl);

    const pdfWindow =
      window.open(
        pdfUrl,
        '_blank',
        'noopener,noreferrer'
      );

    if (!pdfWindow) {
      alert(
        'Please allow pop-ups to open the inspection PDF.'
      );
      return;
    }
  }


  // =====================================================
  // BUILD BACKEND PDF URL
  // =====================================================

  private buildPdfUrl(pdfPath: string): string {

    const rawPath =
      String(pdfPath || '').trim();

    if (!rawPath) {
      return '';
    }

    if (/^https?:\/\//i.test(rawPath)) {
      return rawPath;
    }

    const backendBaseUrl =
      'http://localhost:5000';

    let normalizedPath =
      rawPath
        .replace(/\\/g, '/')
        .trim();

    normalizedPath =
      normalizedPath.replace(/^\/+/, '');

    if (normalizedPath.toLowerCase().startsWith('uploads/')) {
      return backendBaseUrl + '/' + normalizedPath;
    }

    if (normalizedPath.toLowerCase().startsWith('upload/')) {
      return backendBaseUrl + '/' + normalizedPath;
    }

    if (normalizedPath.toLowerCase().startsWith('reports/')) {
      return backendBaseUrl + '/uploads/' + normalizedPath;
    }

    return backendBaseUrl + '/uploads/' + normalizedPath;
  }


  // =====================================================
  // OPEN SAME BACKEND PDF
  // =====================================================

  openGeneratedPdf(): void {

    if (!this.selectedReport) {
      alert('Please open a report first.');
      return;
    }

    const pdfPath =
      this.selectedReport.pdf_path;

    if (!pdfPath || String(pdfPath).trim() === '') {
      alert(
        'Generated PDF path is not available for this report.'
      );
      return;
    }

    const pdfUrl =
      this.buildPdfUrl(String(pdfPath));

    window.open(
      pdfUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }


  // =====================================================
  // DOWNLOAD SAME BACKEND PDF
  // =====================================================

  downloadGeneratedPdf(): void {

    if (!this.selectedReport) {
      alert('Please open a report first.');
      return;
    }

    const pdfPath =
      this.selectedReport.pdf_path;

    if (!pdfPath || String(pdfPath).trim() === '') {
      alert(
        'Generated PDF path is not available for this report.'
      );
      return;
    }

    const link = document.createElement('a');
    link.href = this.buildPdfUrl(String(pdfPath));
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = this.getPdfFileName(String(pdfPath));

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  // =====================================================
  // PDF FILE NAME
  // =====================================================

  private getPdfFileName(pdfPath: string): string {

    const normalized =
      String(pdfPath || '').replace(/\\/g, '/');

    const parts = normalized.split('/');
    const lastPart = parts[parts.length - 1];

    if (
      lastPart &&
      lastPart.toLowerCase().endsWith('.pdf')
    ) {
      return lastPart;
    }

    const reportId =
      this.selectedReport?.report_id ??
      this.selectedReport?.reportId ??
      'inspection-report';

    return (
      'inspection-report-' +
      String(reportId) +
      '.pdf'
    );
  }


  // =====================================================
  // OLD BROWSER PDF IMPLEMENTATION - PRESERVED
  // =====================================================

  printLegacyReport(): void {

    if (
      !this.selectedReport
    ) {

      alert(
        'Please open a report first.'
      );

      return;

    }


    const report =
      this.selectedReport;


    const vehicle =
      report.vehicle || {};


    const owner =
      report.owner || {};


    const inspection =
      report.inspection || {};


    const checklist =
      report.checklist || {};


    // =================================================
    // SAFE TEXT
    // =================================================

    const escapeHtml = (
      value: any
    ): string => {

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {

        return '-';

      }


      return String(value)

        .replace(
          /&/g,
          '&amp;'
        )

        .replace(
          /</g,
          '&lt;'
        )

        .replace(
          />/g,
          '&gt;'
        )

        .replace(
          /"/g,
          '&quot;'
        )

        .replace(
          /'/g,
          '&#039;'
        );

    };


    // =================================================
    // MONEY
    // =================================================

    const money = (
      value: any
    ): string => {

      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {

        return '-';

      }


      const amount =
        Number(value);


      if (
        Number.isNaN(amount)
      ) {

        return '-';

      }


      return new Intl.NumberFormat(
        'en-IN',
        {

          style: 'currency',

          currency: 'INR',

          maximumFractionDigits: 0

        }
      ).format(amount);

    };


    // =================================================
    // DATE
    // =================================================

    const date = (
      value: any
    ): string => {

      if (!value) {

        return '-';

      }


      const parsed =
        new Date(value);


      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {

        return escapeHtml(
          value
        );

      }


      return parsed.toLocaleDateString(
        'en-IN',
        {

          day: '2-digit',

          month: 'short',

          year: 'numeric'

        }
      );

    };


    // =================================================
    // CHECKLIST TITLES
    // =================================================

    const checklistTitles: {
      [key: string]: string;
    } = {

      exterior:
        'Exterior',

      interior_electricals:
        'Interior & Electricals',

      engine_bay:
        'Engine Bay',

      transmission_system:
        'Transmission System',

      suspension_steering:
        'Suspension & Steering',

      braking_system:
        'Braking System',

      tires_wheels:
        'Tyres & Wheels',

      tyres_wheels:
        'Tyres & Wheels',

      electricals_ac:
        'Electricals & AC',

      documents_title:
        'Documents & Title',

      documents:
        'Documents & Title'

    };


    // =================================================
    // CHECKLIST HTML
    // =================================================

    let checklistHtml = '';


    Object.keys(
      checklist
    ).forEach(
      (
        key: string
      ) => {

        const item =
          checklist[key] || {};


        const title =
          checklistTitles[key] ||
          key
            .replace(
              /_/g,
              ' '
            )
            .replace(
              /\b\w/g,
              (
                char: string
              ) =>
                char.toUpperCase()
            );


        const status =
          item.status ??
          item.condition ??
          item.result ??
          '-';


        const remark =
          item.remark ??
          item.remarks ??
          item.note ??
          'No remark available.';


        const lowerStatus =
          String(status)
            .toLowerCase();


        let statusClass =
          'status-neutral';


        if (
          lowerStatus.includes('good') ||
          lowerStatus.includes('ok') ||
          lowerStatus.includes('pass') ||
          lowerStatus.includes('excellent')
        ) {

          statusClass =
            'status-good';

        }


        if (
          lowerStatus.includes('bad') ||
          lowerStatus.includes('poor') ||
          lowerStatus.includes('fail')
        ) {

          statusClass =
            'status-bad';

        }


        checklistHtml += `

          <tr>

            <td class="check-name">

              ${escapeHtml(title)}

            </td>

            <td>

              <span
                class="check-status ${statusClass}"
              >

                ${escapeHtml(status)}

              </span>

            </td>

            <td>

              ${escapeHtml(remark)}

            </td>

          </tr>

        `;

      }
    );


    if (
      !checklistHtml
    ) {

      checklistHtml = `

        <tr>

          <td
            colspan="3"
            class="empty-checklist"
          >

            No checklist data available.

          </td>

        </tr>

      `;

    }


    // =================================================
    // OPEN PRINT WINDOW
    // =================================================

    const printWindow:
      Window | null =
      window.open(
        '',
        '_blank',
        'width=1100,height=900'
      );


    if (!printWindow) {

      alert(
        'Please allow pop-ups for printing the report.'
      );

      return;

    }


    // =================================================
    // PRINT HTML
    // =================================================

    printWindow.document.open();


    printWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>
  Carsey.in - Vehicle Inspection Report
</title>


<style>

@page {

  size: A4;

  margin: 10mm;

}


* {

  box-sizing: border-box;

  -webkit-print-color-adjust: exact;

  print-color-adjust: exact;

}


html,
body {

  margin: 0;

  padding: 0;

  background: #ffffff;

  color: #172033;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  font-size: 11px;

  line-height: 1.4;

}


body {

  width: 100%;

}


.report {

  width: 100%;

  background: #ffffff;

}


/* =================================================
   HEADER
================================================= */

.header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 18px 20px;

  border: 1px solid #dbe3ef;

  background: #f8fafc;

  border-radius: 8px;

  margin-bottom: 15px;

}


.brand {

  font-size: 24px;

  font-weight: 800;

  color: #0f172a;

}


.subtitle {

  color: #64748b;

  margin-top: 3px;

}


.report-meta {

  text-align: right;

}


.meta-label {

  display: block;

  color: #64748b;

  font-size: 9px;

  text-transform: uppercase;

}


.meta-value {

  display: block;

  font-size: 16px;

  font-weight: 800;

  margin-bottom: 5px;

}


/* =================================================
   SECTION
================================================= */

.section {

  margin-bottom: 15px;

  break-inside: avoid;

  page-break-inside: avoid;

}


.section-title {

  background: #0f172a;

  color: #ffffff;

  padding: 9px 12px;

  font-size: 13px;

  font-weight: 700;

  border-radius: 6px 6px 0 0;

}


.section-content {

  border: 1px solid #dbe3ef;

  border-top: none;

  border-radius: 0 0 6px 6px;

  overflow: hidden;

}


/* =================================================
   INFORMATION TABLE
================================================= */

.info-table {

  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;

}


.info-table td {

  width: 33.333%;

  padding: 9px 11px;

  border-right: 1px solid #dbe3ef;

  border-bottom: 1px solid #dbe3ef;

  vertical-align: top;

}


.info-table td:last-child {

  border-right: none;

}


.info-table tr:last-child td {

  border-bottom: none;

}


.label {

  display: block;

  font-size: 8px;

  color: #64748b;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .4px;

  margin-bottom: 3px;

}


.value {

  display: block;

  color: #172033;

  font-size: 10.5px;

  font-weight: 600;

  word-break: break-word;

}


/* =================================================
   INSPECTION
================================================= */

.inspection-grid {

  display: grid;

  grid-template-columns:
    170px 1fr 1fr;

  gap: 10px;

  padding: 10px;

}


.score-box,
.remark-box {

  border: 1px solid #dbe3ef;

  border-radius: 6px;

  padding: 13px;

  background: #f8fafc;

}


.score-label {

  color: #64748b;

  font-size: 9px;

  font-weight: 700;

  text-transform: uppercase;

}


.score-value {

  font-size: 28px;

  font-weight: 800;

  color: #0f172a;

  margin-top: 5px;

}


.remark-title {

  font-size: 9px;

  color: #475569;

  font-weight: 800;

  text-transform: uppercase;

  margin-bottom: 5px;

}


.remark {

  font-size: 10.5px;

  color: #334155;

  word-break: break-word;

}


/* =================================================
   CHECKLIST TABLE
================================================= */

.checklist-table {

  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;

}


.checklist-table th {

  background: #f1f5f9;

  color: #334155;

  font-size: 9px;

  text-transform: uppercase;

  padding: 8px 10px;

  border-bottom: 1px solid #cbd5e1;

  text-align: left;

}


.checklist-table th:nth-child(1) {

  width: 30%;

}


.checklist-table th:nth-child(2) {

  width: 18%;

}


.checklist-table th:nth-child(3) {

  width: 52%;

}


.checklist-table td {

  padding: 8px 10px;

  border-bottom: 1px solid #e2e8f0;

  font-size: 10px;

  vertical-align: top;

  word-break: break-word;

}


.checklist-table tr:last-child td {

  border-bottom: none;

}


.check-name {

  font-weight: 700;

}


.check-status {

  display: inline-block;

  padding: 3px 8px;

  border-radius: 12px;

  font-size: 8px;

  font-weight: 700;

}


.status-good {

  background: #dcfce7;

  color: #166534;

}


.status-bad {

  background: #fee2e2;

  color: #991b1b;

}


.status-neutral {

  background: #e2e8f0;

  color: #475569;

}


.empty-checklist {

  text-align: center;

  padding: 25px !important;

  color: #64748b;

}


/* =================================================
   FOOTER
================================================= */

.footer {

  display: flex;

  justify-content: space-between;

  border-top: 1px solid #dbe3ef;

  padding-top: 10px;

  margin-top: 18px;

  color: #64748b;

  font-size: 8px;

}


/* =================================================
   PAGE BREAK
================================================= */

.section,
.info-table,
.inspection-grid,
.checklist-table {

  break-inside: avoid;

  page-break-inside: avoid;

}


.checklist-table tr {

  break-inside: avoid;

  page-break-inside: avoid;

}


@media print {

  html,
  body {

    background: #ffffff !important;

  }

}

</style>

</head>


<body>


<div class="report">


<!-- =================================================
     HEADER
================================================= -->

<div class="header">

  <div>

    <div class="brand">
      Carsey.in
    </div>

    <div class="subtitle">
      Vehicle Inspection Report
    </div>

  </div>


  <div class="report-meta">

    <span class="meta-label">
      Report ID
    </span>

    <span class="meta-value">
      #${escapeHtml(
        report.report_id ??
        report.reportId
      )}
    </span>


    <span class="meta-label">
      Car ID
    </span>

    <span class="meta-value">
      #${escapeHtml(
        vehicle.car_id ??
        report.car_id ??
        report.carId
      )}
    </span>

  </div>

</div>


<!-- =================================================
     VEHICLE DETAILS
================================================= -->

<div class="section">

  <div class="section-title">
    🚗 Vehicle Details
  </div>


  <div class="section-content">

    <table class="info-table">

      <tr>

        <td>

          <span class="label">
            Brand
          </span>

          <span class="value">
            ${escapeHtml(vehicle.brand)}
          </span>

        </td>


        <td>

          <span class="label">
            Model
          </span>

          <span class="value">
            ${escapeHtml(vehicle.model)}
          </span>

        </td>


        <td>

          <span class="label">
            Variant
          </span>

          <span class="value">
            ${escapeHtml(vehicle.variant)}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            Manufacturing Year
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.manufacturing_year
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Price
          </span>

          <span class="value">
            ${money(vehicle.price)}
          </span>

        </td>


        <td>

          <span class="label">
            Price Note
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.price_short_note
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            Odometer
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.odometer
            )} KM
          </span>

        </td>


        <td>

          <span class="label">
            Fuel Type
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.fuel_type
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Transmission
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.transmission
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            Owner Classification
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.owner_classification
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Registration Number
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.registration_number
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Chassis Number
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.chassis_number
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            Engine Number
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.engine_number
            )}
          </span>

        </td>


        <td>

          <span class="label">
            City
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.city
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Inspection Date
          </span>

          <span class="value">
            ${date(
              vehicle.inspection_date
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            RTO
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.rto
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Spare Key
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.spare_key
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Insurance Type
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.insurance_type
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td>

          <span class="label">
            Insurance Validity
          </span>

          <span class="value">
            ${date(
              vehicle.insurance_validity
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Status
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.status
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Created Date
          </span>

          <span class="value">
            ${date(
              vehicle.created_at
            )}
          </span>

        </td>

      </tr>


      <tr>

        <td colspan="3">

          <span class="label">
            Vehicle Note
          </span>

          <span class="value">
            ${escapeHtml(
              vehicle.vehicle_note
            )}
          </span>

        </td>

      </tr>

    </table>

  </div>

</div>


<!-- =================================================
     OWNER
================================================= -->

<div class="section">

  <div class="section-title">
    👤 Owner Details
  </div>


  <div class="section-content">

    <table class="info-table">

      <tr>

        <td>

          <span class="label">
            Owner Name
          </span>

          <span class="value">
            ${escapeHtml(
              owner.owner_name
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Mobile
          </span>

          <span class="value">
            ${escapeHtml(
              owner.mobile
            )}
          </span>

        </td>


        <td>

          <span class="label">
            Email
          </span>

          <span class="value">
            ${escapeHtml(
              owner.email
            )}
          </span>

        </td>

      </tr>



        <td colspan="2">

          <span class="label">
            Address
          </span>

          <span class="value">
            ${escapeHtml(
              owner.address
            )}
          </span>

        </td>

      </tr>

    </table>

  </div>

</div>


<!-- =================================================
     INSPECTION SUMMARY
================================================= -->

<div class="section">

  <div class="section-title">
    🔍 Inspection Summary
  </div>


  <div class="section-content">

    <div class="inspection-grid">


      <div class="score-box">

        <div class="score-label">
          Overall Score
        </div>

        <div class="score-value">

          ${escapeHtml(
            inspection.overall_score ??
            report.overall_score ??
            0
          )}

          <span
            style="font-size:12px;"
          >
            / 10
          </span>

        </div>

      </div>


      <div class="remark-box">

        <div class="remark-title">
          Engine Remark
        </div>

        <div class="remark">

          ${escapeHtml(
            inspection.engine_remark ??
            report.engine_remark
          )}

        </div>

      </div>


      <div class="remark-box">

        <div class="remark-title">
          Overall Remark
        </div>

        <div class="remark">

          ${escapeHtml(
            inspection.overall_remark ??
            report.overall_remark
          )}

        </div>

      </div>


    </div>

  </div>

</div>


<!-- =================================================
     CHECKLIST
================================================= -->

<div class="section">

  <div class="section-title">
    ✅ Inspection Checklist
  </div>


  <div class="section-content">

    <table class="checklist-table">

      <thead>

        <tr>

          <th>
            Inspection Area
          </th>

          <th>
            Status
          </th>

          <th>
            Remark
          </th>

        </tr>

      </thead>


      <tbody>

        ${checklistHtml}

      </tbody>

    </table>

  </div>

</div>


<!-- =================================================
     FOOTER
================================================= -->

<div class="footer">

  <span>
    Generated by Carsey.in
  </span>

  <span>
    Vehicle Inspection Report
  </span>

</div>


</div>


</body>

</html>

    `);


    printWindow.document.close();


    // =================================================
    // PRINT
    // =================================================

    printWindow.onload = () => {

      setTimeout(
        () => {

          printWindow.focus();

          printWindow.print();

        },
        500
      );

    };

  }


}