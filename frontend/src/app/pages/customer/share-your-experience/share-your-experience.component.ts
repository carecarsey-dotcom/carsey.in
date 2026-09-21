import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-share-your-experience',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './share-your-experience.component.html'
})
export class ShareYourExperienceComponent {

  // ======================================================
  // API
  // ======================================================

  private apiUrl =
    'https://api.carsey.in/api/share-your-experience';


  // ======================================================
  // FORM
  // ======================================================

  form = {
    name: '',
    mobile: '',
    rating: 0,
    review: '',
    photo: null as File | null
  };


  // ======================================================
  // UI STATES
  // ======================================================

  photoPreview: string | null = null;

  submitted = false;

  submitting = false;

  errorMessage = '';


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    private http: HttpClient
  ) {}


  // ======================================================
  // SET RATING
  // ======================================================

  setRating(
    rating: number
  ): void {

    this.form.rating = rating;

    this.errorMessage = '';
  }


  // ======================================================
  // PHOTO SELECT
  // ======================================================

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


    // ----------------------------------------------------
    // ALLOWED FILE TYPES
    // ----------------------------------------------------

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


    // ----------------------------------------------------
    // MAX FILE SIZE
    // ----------------------------------------------------

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


    // ----------------------------------------------------
    // SAVE FILE
    // ----------------------------------------------------

    this.form.photo = file;


    // ----------------------------------------------------
    // PREVIEW
    // ----------------------------------------------------

    const reader =
      new FileReader();


    reader.onload = () => {

      this.photoPreview =
        reader.result as string;

    };


    reader.readAsDataURL(file);


    this.errorMessage = '';
  }


  // ======================================================
  // REMOVE PHOTO
  // ======================================================

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


  // ======================================================
  // SUBMIT REVIEW
  // ======================================================

  submitReview(): void {

    // ----------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // ----------------------------------------------------

    if (this.submitting) {
      return;
    }


    this.errorMessage = '';


    // ----------------------------------------------------
    // NAME VALIDATION
    // ----------------------------------------------------

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


    // ----------------------------------------------------
    // RATING VALIDATION
    // ----------------------------------------------------

    if (
      !this.form.rating
    ) {

      this.errorMessage =
        'Please select a rating.';

      return;
    }


    // ----------------------------------------------------
    // REVIEW VALIDATION
    // ----------------------------------------------------

    if (
      !this.form.review ||
      !this.form.review.trim()
    ) {

      this.errorMessage =
        'Please write your review.';

      return;
    }


    // ----------------------------------------------------
    // MOBILE VALIDATION
    // ----------------------------------------------------

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


    // ====================================================
    // FORM DATA
    // ====================================================

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


    // ----------------------------------------------------
    // OPTIONAL PHOTO
    // ----------------------------------------------------

    if (
      this.form.photo
    ) {

      formData.append(
        'photo',
        this.form.photo
      );

    }


    // ====================================================
    // START SUBMISSION
    // ====================================================

    this.submitting = true;


    // ====================================================
    // API REQUEST
    // ====================================================

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

        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------

        next: (response) => {

          console.log(
            'Share Your Experience Response:',
            response
          );


          this.submitting = false;

          this.submitted = true;

          this.errorMessage = '';

        },


        // ------------------------------------------------
        // ERROR
        // ------------------------------------------------

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


  // ======================================================
  // RESET FORM
  // ======================================================

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