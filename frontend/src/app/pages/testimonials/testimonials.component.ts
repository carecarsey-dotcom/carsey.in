import {
  CommonModule
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';

import {
  Component,
  OnInit
} from '@angular/core';


interface Testimonial {
  id: number;

  name: string;

  mobile: string | null;

  rating: number;

  review: string;

  photo: string | null;

  status:
    | 'Pending'
    | 'Approved'
    | 'Rejected';

  created_at: string;

  updated_at: string;
}


@Component({
  selector: 'app-testimonials',

  standalone: true,

  imports: [
    CommonModule,
    HttpClientModule
  ],

  templateUrl:
    './testimonials.component.html'
})


export class TestimonialsComponent
  implements OnInit {


  // =====================================================
  // API
  // =====================================================

  private readonly apiUrl =
    'https://api.carsey.in/api/admin/share-your-experience';


  // =====================================================
  // REVIEWS
  // =====================================================

  reviews: Testimonial[] = [];


  // =====================================================
  // FILTER
  // =====================================================

  selectedStatus:
    | 'All'
    | 'Pending'
    | 'Approved'
    | 'Rejected' = 'Pending';


  // =====================================================
  // LOADING
  // =====================================================

  loading = false;


  // =====================================================
  // ACTION LOADING
  // =====================================================

  actionLoadingId:
    number | null = null;


  // =====================================================
  // ERROR
  // =====================================================

  errorMessage = '';


  // =====================================================
  // SUCCESS
  // =====================================================

  successMessage = '';


  // =====================================================
  // VIEW REVIEW
  // =====================================================

  selectedReview:
    Testimonial | null = null;


  // =====================================================
  // IMAGE BASE URL
  // =====================================================

  readonly imageBaseUrl =
    'https://api.carsey.in/uploads/share-your-experience/';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadReviews();

  }


  // =====================================================
  // GET TOKEN
  // =====================================================

  private getToken(): string {

    return (
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      ''
    );

  }


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      this.getToken();

    return new HttpHeaders({
      Authorization:
        `Bearer ${token}`
    });

  }


  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  loadReviews(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';

    let url =
      this.apiUrl;


    if (
      this.selectedStatus !== 'All'
    ) {

      url +=
        `?status=${encodeURIComponent(
          this.selectedStatus
        )}`;

    }


    this.http
      .get<{
        success: boolean;

        data: Testimonial[];
      }>(
        url,
        {
          headers:
            this.getHeaders()
        }
      )
      .subscribe({

        next: (response) => {

          this.loading = false;

          if (
            response &&
            response.success
          ) {

            this.reviews =
              response.data || [];

          } else {

            this.reviews = [];

            this.errorMessage =
              'Unable to load testimonials.';

          }

        },


        error: (error) => {

          console.error(
            'Load Testimonials Error:',
            error
          );

          this.loading = false;

          this.reviews = [];

          this.errorMessage =
            error?.error?.message ||
            'Unable to load testimonials. Please try again.';

        }

      });

  }


  // =====================================================
  // STATUS FILTER
  // =====================================================

  changeStatus(
    status:
      | 'All'
      | 'Pending'
      | 'Approved'
      | 'Rejected'
  ): void {

    this.selectedStatus =
      status;

    this.selectedReview =
      null;

    this.loadReviews();

  }


  // =====================================================
  // APPROVE
  // =====================================================

  approveReview(
    review: Testimonial
  ): void {

    this.updateStatus(
      review,
      'Approved'
    );

  }


  // =====================================================
  // REJECT
  // =====================================================

  rejectReview(
    review: Testimonial
  ): void {

    this.updateStatus(
      review,
      'Rejected'
    );

  }


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  private updateStatus(
    review: Testimonial,
    status:
      | 'Approved'
      | 'Rejected'
  ): void {

    if (
      this.actionLoadingId !== null
    ) {

      return;

    }


    const action =
      status === 'Approved'
        ? 'approve'
        : 'reject';


    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} this review?`
      );


    if (!confirmed) {

      return;

    }


    this.actionLoadingId =
      review.id;

    this.errorMessage = '';

    this.successMessage = '';


    this.http
      .patch<{
        success: boolean;

        message: string;

        data: Testimonial;
      }>(
        `${this.apiUrl}/${review.id}/status`,

        {
          status
        },

        {
          headers:
            this.getHeaders()
        }
      )
      .subscribe({

        next: (response) => {

          this.actionLoadingId =
            null;


          if (
            response &&
            response.success
          ) {

            this.successMessage =
              response.message ||
              `Review ${status.toLowerCase()} successfully.`;


            if (
              this.selectedReview &&
              this.selectedReview.id ===
                review.id
            ) {

              this.selectedReview =
                response.data;

            }


            this.loadReviews();

          } else {

            this.errorMessage =
              'Unable to update review status.';

          }

        },


        error: (error) => {

          console.error(
            'Update Testimonial Status Error:',
            error
          );

          this.actionLoadingId =
            null;

          this.errorMessage =
            error?.error?.message ||
            'Unable to update review status. Please try again.';

        }

      });

  }


  // =====================================================
  // VIEW REVIEW
  // =====================================================

  viewReview(
    review: Testimonial
  ): void {

    this.selectedReview =
      review;

  }


  // =====================================================
  // CLOSE REVIEW
  // =====================================================

  closeReview(): void {

    this.selectedReview =
      null;

  }


  // =====================================================
  // PHOTO URL
  // =====================================================

  getPhotoUrl(
    photo: string | null
  ): string {

    if (!photo) {

      return '';

    }


    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://')
    ) {

      return photo;

    }


    return (
      this.imageBaseUrl +
      photo
    );

  }


  // =====================================================
  // STAR ARRAY
  // =====================================================

  getStars(
    rating: number
  ): number[] {

    return Array.from(
      {
        length: 5
      },
      (_, index) =>
        index + 1
    );

  }


  // =====================================================
  // TRACK BY
  // =====================================================

  trackByReviewId(
    index: number,
    review: Testimonial
  ): number {

    return review.id;

  }


  // =====================================================
  // DATE FORMAT
  // =====================================================

  formatDate(
    date: string
  ): string {

    if (!date) {

      return '';

    }


    return new Date(
      date
    ).toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }

}