import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  SellCarRequest,
  SellCarService
} from '../../services/sell-car.service';


@Component({

  selector:
    'app-sell-car-requests',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './sell-car-requests.component.html',

  styleUrl:
    './sell-car-requests.component.css'

})
export class SellCarRequestsComponent
  implements OnInit {


  private sellCarService =
    inject(SellCarService);


  requests:
    SellCarRequest[] = [];


  loading = false;

  errorMessage = '';

  updatingSellId:
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


    this.sellCarService
      .getRequests()
      .subscribe({

        next: (response) => {

          console.log(
            'Sell Car Requests:',
            response
          );


          if (response.success) {

            this.requests =
              response.data?.requests ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load sell car requests.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Sell Car API Error:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'Unable to load sell car requests.';


          this.loading = false;

        }

      });

  }


  // ====================================================
  // APPROVE
  // ====================================================

  approve(
    request: SellCarRequest
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
    request: SellCarRequest
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

    request: SellCarRequest,

    status:
      'Approved' |
      'Rejected'

  ): void {

    this.updatingSellId =
      request.sell_id;


    this.sellCarService
      .updateStatus(
        request.sell_id,
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
              'Unable to update sell car status.'
            );

          }


          this.updatingSellId =
            null;

        },


        error: (error) => {

          console.error(
            'Update Sell Car Error:',
            error
          );


          alert(
            error?.error?.message ||
            'Unable to update sell car status.'
          );


          this.updatingSellId =
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


  // ====================================================
  // IMAGE URL
  // ====================================================

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


    return `http://localhost:5000${image}`;

  }

}