import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  LoanRequest,
  LoanService
} from '../../services/loan.service';


@Component({

  selector:
    'app-loan-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './loan-requests.component.html',

  styleUrl:
    './loan-requests.component.css'

})
export class LoanRequestsComponent
  implements OnInit {


  private loanService =
    inject(LoanService);


  loans:
    LoanRequest[] = [];


  loading = false;

  errorMessage = '';

  updatingLoanId:
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


    this.loanService
      .getRequests()
      .subscribe({

        next: (response) => {

          console.log(
            'Loan Requests:',
            response
          );


          if (response.success) {

            this.loans =
              response.data?.loans ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load loan requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Loan API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load loan requests.';


          this.loading = false;

        }

      });

  }


  // ====================================================
  // APPROVE
  // ====================================================

  approve(
    loan: LoanRequest
  ): void {

    this.updateStatus(
      loan,
      'Approved'
    );

  }


  // ====================================================
  // REJECT
  // ====================================================

  reject(
    loan: LoanRequest
  ): void {

    this.updateStatus(
      loan,
      'Rejected'
    );

  }


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  private updateStatus(

    loan: LoanRequest,

    status:
      'Approved' |
      'Rejected'

  ): void {

    this.updatingLoanId =
      loan.loan_id;


    this.loanService
      .updateStatus(
        loan.loan_id,
        status
      )
      .subscribe({

        next: (response) => {

          if (response.success) {

            loan.status =
              status;

          } else {

            alert(
              response.message ||
              'Unable to update loan status.'
            );

          }


          this.updatingLoanId =
            null;

        },


        error: (error) => {

          console.error(
            'Update Loan Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update loan status.'
          );


          this.updatingLoanId =
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