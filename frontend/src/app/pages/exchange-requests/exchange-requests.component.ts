import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ExchangeRequest,
  ExchangeService
} from '../../services/exchange.service';


@Component({

  selector:
    'app-exchange-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './exchange-requests.component.html',

  styleUrl:
    './exchange-requests.component.css'

})
export class ExchangeRequestsComponent
  implements OnInit {


  private exchangeService =
    inject(ExchangeService);


  requests:
    ExchangeRequest[] = [];


  loading = false;

  errorMessage = '';

  updatingExchangeId:
    number | null = null;


  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.loadRequests();

  }


  // ==========================================
  // LOAD
  // ==========================================

  loadRequests(): void {

    this.loading = true;

    this.errorMessage = '';


    this.exchangeService
      .getRequests()
      .subscribe({

        next: (response) => {

          console.log(
            'Exchange Requests:',
            response
          );


          if (response.success) {

            this.requests =
              response.data?.requests ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load exchange requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Exchange API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load exchange requests.';


          this.loading = false;

        }

      });

  }


  // ==========================================
  // APPROVE
  // ==========================================

  approve(
    request: ExchangeRequest
  ): void {

    this.updateStatus(
      request,
      'Approved'
    );

  }


  // ==========================================
  // REJECT
  // ==========================================

  reject(
    request: ExchangeRequest
  ): void {

    this.updateStatus(
      request,
      'Rejected'
    );

  }


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  private updateStatus(

    request: ExchangeRequest,

    status:
      'Approved' |
      'Rejected'

  ): void {

    this.updatingExchangeId =
      request.exchange_id;


    this.exchangeService
      .updateStatus(
        request.exchange_id,
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
              'Unable to update exchange status.'
            );

          }


          this.updatingExchangeId =
            null;

        },


        error: (error) => {

          console.error(
            'Update Exchange Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update exchange status.'
          );


          this.updatingExchangeId =
            null;

        }

      });

  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

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


  // ==========================================
  // IMAGE URL
  // ==========================================

  getImageUrl(
    image?: string
  ): string {

    if (!image) {

      return '';

    }


    if (
      image.startsWith('http')
    ) {

      return image;

    }


    return `http://localhost:5000/${image}`;

  }

}