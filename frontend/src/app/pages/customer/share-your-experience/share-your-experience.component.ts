import {
  CommonModule
} from '@angular/common';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';


// ======================================================
// TESTIMONIAL
// ======================================================

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

  updated_at?: string;

}


// ======================================================
// COMPONENT
// ======================================================

@Component({

  selector:
    'app-share-your-experience',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],

  templateUrl:
    './share-your-experience.component.html'

})


export class ShareYourExperienceComponent
  implements OnInit {


  // ====================================================
  // API
  // ====================================================

  private readonly apiUrl =
    'https://api.carsey.in/api/share-your-experience';


  // ====================================================
  // APPROVED REVIEWS API
  // ====================================================

  private readonly approvedReviewsApiUrl =
    'https://api.carsey.in/api/share-your-experience/approved';


  // ====================================================
  // IMAGE BASE URL
  // ====================================================

  readonly imageBaseUrl =
    'https://api.carsey.in/uploads/share-your-experience/';


  // ====================================================
  // FORM
  // ====================================================

  form = {

    name: '',

    mobile: '',

    rating: 0,

    review: '',

    photo: null as File | null

  };


  // ====================================================
  // PHOTO PREVIEW
  // ====================================================

  photoPreview:
    string | null = null;


  // ====================================================
  // FORM STATE
  // ====================================================

  submitted = false;

  submitting = false;

  errorMessage = '';


  // ====================================================
  // APPROVED REVIEWS
  // ====================================================

  approvedReviews:
    Testimonial[] = [];


  reviewsLoading = false;

  reviewsError = '';


  // ====================================================
  // CONSTRUCTOR
  // ====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // ====================================================
  // INIT
  // ====================================================

  ngOnInit(): void {

    this.loadApprovedReviews();

  }


  // ====================================================
  // LOAD APPROVED REVIEWS
  // PUBLIC
  // ====================================================

  loadApprovedReviews(): void {

    this.reviewsLoading = true;

    this.reviewsError = '';


    this.http
      .get<{
        success: boolean;
        data: Testimonial[];
      }>(
        this.approvedReviewsApiUrl
      )
      .subscribe({

        next: (response) => {

          this.reviewsLoading = false;


          if (
            response &&
            response.success
          ) {

            this.approvedReviews =
              response.data || [];

          } else {

            this.approvedReviews = [];

            this.reviewsError =
              'Unable to load customer reviews.';

          }

        },


        error: (error) => {

          console.error(
            'Load Approved Reviews Error:',
            error
          );

          this.reviewsLoading = false;

          this.approvedReviews = [];

          this.reviewsError =
            error?.error?.message ||
            'Unable to load customer reviews. Please try again later.';

        }

      });

  }


  // ====================================================
  // SET RATING
  // ====================================================

  setRating(
    rating: number
  ): void {

    this.form.rating = rating;

    this.errorMessage = '';

  }


  // ====================================================
  // PHOTO SELECTED
  // ====================================================

  onPhotoSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.form.photo = null;

      this.photoPreview = null;

      return;

    }


    const file =
      input.files[0];


    // --------------------------------------------------
    // ALLOWED TYPES
    // --------------------------------------------------

    const allowedTypes = [

      'image/jpeg',

      'image/jpg',

      'image/png',

      'image/webp'

    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        'Please upload JPG, JPEG, PNG or WEBP image.'
      );

      input.value = '';

      this.form.photo = null;

      this.photoPreview = null;

      return;

    }


    // --------------------------------------------------
    // MAX SIZE 5 MB
    // --------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        'Photo size should not be more than 5 MB.'
      );

      input.value = '';

      this.form.photo = null;

      this.photoPreview = null;

      return;

    }


    // --------------------------------------------------
    // SAVE FILE
    // --------------------------------------------------

    this.form.photo = file;


    // --------------------------------------------------
    // PREVIEW
    // --------------------------------------------------

    const reader =
      new FileReader();


    reader.onload = () => {

      this.photoPreview =
        reader.result as string;

    };


    reader.readAsDataURL(file);


    this.errorMessage = '';

  }


  // ====================================================
  // REMOVE PHOTO
  // ====================================================

  removePhoto(): void {

    this.form.photo = null;

    this.photoPreview = null;


    const input =
      document.getElementById(
        'review-photo'
      ) as HTMLInputElement | null;


    if (input) {

      input.value = '';

    }

  }


  // ====================================================
  // SUBMIT REVIEW
  // ====================================================

  submitReview(): void {

    if (this.submitting) {

      return;

    }


    this.errorMessage = '';


    // --------------------------------------------------
    // NAME
    // --------------------------------------------------

    if (
      !this.form.name ||
      !this.form.name.trim()
    ) {

      this.errorMessage =
        'Please enter your name.';

      return;

    }


    if (
      this.form.name.trim().length < 2
    ) {

      this.errorMessage =
        'Please enter a valid name.';

      return;

    }


    // --------------------------------------------------
    // RATING
    // --------------------------------------------------

    if (!this.form.rating) {

      this.errorMessage =
        'Please select a rating.';

      return;

    }


    // --------------------------------------------------
    // REVIEW
    // --------------------------------------------------

    if (
      !this.form.review ||
      !this.form.review.trim()
    ) {

      this.errorMessage =
        'Please write your review.';

      return;

    }


    // --------------------------------------------------
    // MOBILE
    // --------------------------------------------------

    if (
      this.form.mobile &&
      !/^[0-9]{10}$/.test(
        this.form.mobile.trim()
      )
    ) {

      this.errorMessage =
        'Please enter a valid 10 digit mobile number.';

      return;

    }


    // --------------------------------------------------
    // FORMDATA
    // --------------------------------------------------

    const formData =
      new FormData();


    formData.append(
      'name',
      this.form.name.trim()
    );


    formData.append(
      'mobile',
      this.form.mobile
        ? this.form.mobile.trim()
        : ''
    );


    formData.append(
      'rating',
      String(this.form.rating)
    );


    formData.append(
      'review',
      this.form.review.trim()
    );


    // --------------------------------------------------
    // PHOTO
    // --------------------------------------------------

    if (this.form.photo) {

      formData.append(
        'photo',
        this.form.photo
      );

    }


    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    this.submitting = true;


    this.http
      .post<{
        success: boolean;

        message: string;

        data?: {
          reviewId?: number;
        };

      }>(
        this.apiUrl,
        formData
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Share Your Experience Response:',
            response
          );


          this.submitting = false;

          this.submitted = true;

          this.errorMessage = '';

        },


        error: (error) => {

          console.error(
            'Share Your Experience Error:',
            error
          );


          this.submitting = false;


          if (
            error?.error?.message
          ) {

            this.errorMessage =
              error.error.message;

          } else {

            this.errorMessage =
              'Unable to submit your review. Please try again later.';

          }

        }

      });

  }


  // ====================================================
  // GET PHOTO URL
  // ====================================================

  getPhotoUrl(
    photo: string | null
  ): string {

    if (!photo) {

      return '';

    }


    if (
      photo.startsWith(
        'http://'
      ) ||
      photo.startsWith(
        'https://'
      )
    ) {

      return photo;

    }


    return (
      this.imageBaseUrl +
      photo
    );

  }


  // ====================================================
  // GET STAR ARRAY
  // ====================================================

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


  // ====================================================
  // RESET FORM
  // ====================================================

  resetForm(): void {

    this.form = {

      name: '',

      mobile: '',

      rating: 0,

      review: '',

      photo: null

    };


    this.photoPreview = null;

    this.submitted = false;

    this.submitting = false;

    this.errorMessage = '';


    const input =
      document.getElementById(
        'review-photo'
      ) as HTMLInputElement | null;


    if (input) {

      input.value = '';

    }

  }

}