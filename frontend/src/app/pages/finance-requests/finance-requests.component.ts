import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FinanceRequest,
  FinanceService
} from '../../services/finance.service';


@Component({

  selector:
    'app-finance-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './finance-requests.component.html',

  styleUrl:
    './finance-requests.component.css'

})
export class FinanceRequestsComponent
  implements OnInit {


  private financeService =
    inject(FinanceService);


  requests:
    FinanceRequest[] = [];


  loading = false;

  errorMessage = '';

  updatingFinanceId:
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


    this.financeService
      .getRequests()
      .subscribe({

        next: (response) => {

          console.log(
            'Finance Requests:',
            response
          );


          if (response.success) {

            this.requests =
              response.data?.requests ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load finance requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Finance API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load finance requests.';


          this.loading = false;

        }

      });

  }


  // ====================================================
  // APPROVE
  // ====================================================

  approve(
    request: FinanceRequest
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
    request: FinanceRequest
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

    request: FinanceRequest,

    status:
      'Approved' |
      'Rejected'

  ): void {

    this.updatingFinanceId =
      request.finance_id;


    this.financeService
      .updateStatus(
        request.finance_id,
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
              'Unable to update finance status.'
            );

          }


          this.updatingFinanceId =
            null;

        },


        error: (error) => {

          console.error(
            'Update Finance Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update finance status.'
          );


          this.updatingFinanceId =
            null;

        }

      });

  }


  // ====================================================
  // STATUS CLASS
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