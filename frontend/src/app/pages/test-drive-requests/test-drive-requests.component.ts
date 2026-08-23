import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  TestDriveRequest,
  TestDriveService
} from '../../services/test-drive.service';


@Component({
  selector: 'app-test-drive-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './test-drive-requests.component.html',

  styleUrl:
    './test-drive-requests.component.css'
})
export class TestDriveRequestsComponent
  implements OnInit {


  private testDriveService =
    inject(TestDriveService);


  requests:
    TestDriveRequest[] = [];


  loading = false;

  errorMessage = '';

  updatingRequestId:
    number | null = null;


  // ====================================================
  // INIT
  // ====================================================

  ngOnInit(): void {

    this.loadRequests();

  }


  // ====================================================
  // LOAD REQUESTS
  // ====================================================

  loadRequests(): void {

    this.loading = true;

    this.errorMessage = '';


    this.testDriveService
      .getRequests()
      .subscribe({

        next: (response) => {

          console.log(
            'Test Drive Requests:',
            response
          );


          if (response.success) {

            this.requests =
              response.data?.requests ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load test drive requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Test Drive API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load test drive requests.';


          this.loading = false;

        }

      });

  }


  // ====================================================
  // APPROVE
  // ====================================================

  approve(
    request: TestDriveRequest
  ): void {

    this.updateStatus(
      request,
      'Approved'
    );

  }


  // ====================================================
  // REJECT
  // ====================================================

  reject(
    request: TestDriveRequest
  ): void {

    this.updateStatus(
      request,
      'Rejected'
    );

  }


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  private updateStatus(
    request: TestDriveRequest,

    status:
      'Approved' |
      'Rejected'
  ): void {

    this.updatingRequestId =
      request.request_id;


    this.testDriveService
      .updateStatus(
        request.request_id,
        status
      )
      .subscribe({

        next: (response) => {

          if (response.success) {

            request.status =
              status;

          } else {

            alert(
              response.message ||
              'Unable to update status.'
            );

          }


          this.updatingRequestId = null;

        },


        error: (error) => {

          console.error(
            'Update Test Drive Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update test drive status.'
          );


          this.updatingRequestId = null;

        }

      });

  }


  // ====================================================
  // STATUS STYLE
  // ====================================================

  getStatusClass(
    status?: string
  ): string {

    if (
      status === 'Approved'
    ) {

      return 'bg-green-100 text-green-700';

    }


    if (
      status === 'Rejected'
    ) {

      return 'bg-red-100 text-red-700';

    }


    return 'bg-yellow-100 text-yellow-700';

  }

}