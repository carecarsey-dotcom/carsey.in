import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ReportUnlockService,
  ReportUnlockRequest
} from '../../services/report-unlock.service';


@Component({
  selector: 'app-report-unlock-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './report-unlock-requests.component.html',

  styleUrl:
    './report-unlock-requests.component.css'
})
export class ReportUnlockRequestsComponent
  implements OnInit {

  private reportUnlockService =
    inject(ReportUnlockService);


  requests: ReportUnlockRequest[] = [];

  loading = false;

  errorMessage = '';

  updatingRequestId: number | null = null;


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    this.loadRequests();

  }


  // ======================================================
  // LOAD REQUESTS
  // ======================================================

  loadRequests(): void {

    this.loading = true;

    this.errorMessage = '';


    this.reportUnlockService
      .getRequests()
      .subscribe({

        next: (response: any) => {

          console.log(
            'Report Unlock Response:',
            response
          );


          if (response.success) {

            this.requests =
              response.data?.requests ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load report unlock requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Report Unlock API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load report unlock requests.';


          this.loading = false;

        }

      });

  }


  // ======================================================
  // UPDATE STATUS
  // ======================================================

  updateStatus(
    requestId: number,
    status: 'Approved' | 'Rejected'
  ): void {

    if (this.updatingRequestId !== null) {

      return;

    }


    this.updatingRequestId =
      requestId;


    this.reportUnlockService
      .updateStatus(
        requestId,
        status
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'Status Update Response:',
            response
          );


          if (response.success) {

            const request =
              this.requests.find(
                item =>
                  item.request_id ===
                  requestId
              );


            if (request) {

              request.status =
                status;

            }

          } else {

            alert(
              response.message ||
              'Unable to update request status.'
            );

          }


          this.updatingRequestId =
            null;

        },


        error: (error) => {

          console.error(
            'Update Report Unlock Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update request status.'
          );


          this.updatingRequestId =
            null;

        }

      });

  }


  // ======================================================
  // STATUS CLASS
  // ======================================================

  getStatusClass(
    status: string
  ): string {

    if (status === 'Approved') {

      return 'bg-green-100 text-green-700';

    }


    if (status === 'Rejected') {

      return 'bg-red-100 text-red-700';

    }


    return 'bg-yellow-100 text-yellow-700';

  }

}