import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';


@Component({
  selector: 'app-employee-management',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './employee-management.component.html'
})


export class EmployeeManagementComponent {

  private readonly http =
    inject(HttpClient);


  // ======================================================
  // API URL
  // ======================================================

  private readonly apiUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : 'https://api.carsey.in/api';


  // ======================================================
  // EMPLOYEE LIST
  // ======================================================

  employees: any[] = [];


  // ======================================================
  // LOADING
  // ======================================================

  loading = false;


  // ======================================================
  // SAVING
  // ======================================================

  saving = false;


  // ======================================================
  // ERROR
  // ======================================================

  errorMessage = '';


  // ======================================================
  // SUCCESS
  // ======================================================

  successMessage = '';


  // ======================================================
  // ADD EMPLOYEE FORM
  // ======================================================

  showAddEmployeeForm = false;

  employeeName = '';

  employeeEmail = '';

  // Employee mobile number
  employeeMobile = '';

  employeePassword = '';


  // ======================================================
  // FORM ERROR
  // ======================================================

  formError = '';


  // ======================================================
  // STATUS UPDATE
  // ======================================================

  updatingEmployeeId: number | null = null;


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor() {

    this.loadEmployees();

  }


  // ======================================================
  // AUTH HEADERS
  // ======================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');


    let headers =
      new HttpHeaders({
        'Content-Type': 'application/json'
      });


    if (token) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );

    }


    return headers;

  }


  // ======================================================
  // LOAD EMPLOYEES
  // ======================================================

  loadEmployees(): void {

    this.loading = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.http

      .get<any>(
        `${this.apiUrl}/auth/employees`,
        {
          headers: this.getHeaders()
        }
      )

      .subscribe({

        next: (response) => {

          console.log(
            'Employees Response:',
            response
          );


          if (
            response &&
            response.success
          ) {

            const data =
              response.data;


            if (Array.isArray(data)) {

              this.employees =
                data;

            }

            else if (
              Array.isArray(data?.employees)
            ) {

              this.employees =
                data.employees;

            }

            else if (
              Array.isArray(response.employees)
            ) {

              this.employees =
                response.employees;

            }

            else {

              this.employees =
                [];

            }

          }

          else {

            this.employees =
              [];

            this.errorMessage =
              response?.message ||
              'Unable to load employees.';

          }


          this.loading = false;

        },


        error: (error) => {

          console.error(
            'Load Employees Error:',
            error
          );


          this.loading = false;


          this.errorMessage =
            error?.error?.message ||
            'Unable to load employees.';

        }

      });

  }


  // ======================================================
  // OPEN ADD EMPLOYEE FORM
  // ======================================================

  openAddEmployeeForm(): void {

    this.showAddEmployeeForm = true;

    this.clearMessages();

    this.resetForm();

  }


  // ======================================================
  // CLOSE ADD EMPLOYEE FORM
  // ======================================================

  closeAddEmployeeForm(): void {

    if (this.saving) {

      return;

    }


    this.showAddEmployeeForm =
      false;


    this.formError =
      '';


    this.resetForm();

  }


  // ======================================================
  // RESET FORM
  // ======================================================

  private resetForm(): void {

    this.employeeName = '';

    this.employeeEmail = '';

    this.employeeMobile = '';

    this.employeePassword = '';

  }


  // ======================================================
  // CLEAR MESSAGES
  // ======================================================

  private clearMessages(): void {

    this.errorMessage = '';

    this.successMessage = '';

    this.formError = '';

  }


  // ======================================================
  // EMPLOYEE MOBILE INPUT
  // ======================================================

  onEmployeeMobileInput(): void {
    this.employeeMobile = this.employeeMobile
      .replace(/\\D/g, '')
      .slice(0, 10);
  }


  // ======================================================
  // CREATE EMPLOYEE
  // ======================================================

  createEmployee(): void {

    this.formError = '';

    this.errorMessage = '';

    this.successMessage = '';


    // ==================================================
    // NAME VALIDATION
    // ==================================================

    const name =
      this.employeeName.trim();


    if (!name) {

      this.formError =
        'Employee name is required.';

      return;

    }


    // ==================================================
    // EMAIL VALIDATION
    // ==================================================

    const email =
      this.employeeEmail
        .trim()
        .toLowerCase();


    if (!email) {

      this.formError =
        'Employee email is required.';

      return;

    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

      this.formError =
        'Please enter a valid email address.';

      return;

    }


    // ==================================================
    // MOBILE NUMBER VALIDATION
    // ==================================================

    const mobile =
      this.employeeMobile
        .replace(/\D/g, '')
        .trim();


    if (!mobile) {

      this.formError =
        'Employee mobile number is required.';

      return;
    }


    if (!/^[6-9]\d{9}$/.test(mobile)) {

      this.formError =
        'Please enter a valid 10 digit mobile number.';

      return;
    }


    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    const password =
      this.employeePassword;


    if (!password) {

      this.formError =
        'Employee password is required.';

      return;

    }


    if (password.length < 6) {

      this.formError =
        'Password must be at least 6 characters.';

      return;

    }


    // ==================================================
    // START SAVING
    // ==================================================

    this.saving = true;


    const payload = {

      name,

      email,

      mobile,

      password

    };


    console.log(
      'Create Employee Payload:',
      {
        name,
        email,
        mobile
      }
    );


    // ==================================================
    // CREATE EMPLOYEE API
    // ==================================================

    this.http

      .post<any>(
        `${this.apiUrl}/auth/employees`,
        payload,
        {
          headers: this.getHeaders()
        }
      )

      .subscribe({

        next: (response) => {

          console.log(
            'Create Employee Response:',
            response
          );


          this.saving = false;


          if (
            response &&
            response.success
          ) {

            this.successMessage =
              response.message ||
              'Employee created successfully.';


            this.showAddEmployeeForm =
              false;


            this.resetForm();


            // Refresh employee list

            this.loadEmployees();

          }

          else {

            this.formError =
              response?.message ||
              'Employee could not be created.';

          }

        },


        error: (error) => {

          console.error(
            'Create Employee Error:',
            error
          );


          this.saving = false;


          this.formError =
            error?.error?.message ||
            'Employee could not be created.';

        }

      });

  }


  // ======================================================
  // ACTIVATE / DEACTIVATE EMPLOYEE
  // ======================================================

  toggleEmployeeStatus(
    employee: any
  ): void {

    const employeeId =
      Number(
        employee?.admin_id ??
        employee?.employee_id ??
        employee?.id
      );


    if (!employeeId) {

      this.errorMessage =
        'Employee ID not found.';

      return;

    }


    const currentStatus =
      String(
        employee?.status ||
        'Active'
      );


    const newStatus =
      currentStatus === 'Active'
        ? 'Inactive'
        : 'Active';


    const confirmed =
      window.confirm(
        `Are you sure you want to ${newStatus === 'Active' ? 'activate' : 'deactivate'} this employee?`
      );


    if (!confirmed) {

      return;

    }


    this.updatingEmployeeId =
      employeeId;


    this.errorMessage = '';

    this.successMessage = '';


    // ==================================================
    // UPDATE STATUS API
    // ==================================================

    this.http

      .patch<any>(
        `${this.apiUrl}/auth/employees/${employeeId}/status`,
        {
          status: newStatus
        },
        {
          headers: this.getHeaders()
        }
      )

      .subscribe({

        next: (response) => {

          console.log(
            'Employee Status Response:',
            response
          );


          this.updatingEmployeeId =
            null;


          if (
            response &&
            response.success
          ) {

            this.successMessage =
              response.message ||
              'Employee status updated successfully.';


            this.loadEmployees();

          }

          else {

            this.errorMessage =
              response?.message ||
              'Employee status could not be updated.';

          }

        },


        error: (error) => {

          console.error(
            'Employee Status Error:',
            error
          );


          this.updatingEmployeeId =
            null;


          this.errorMessage =
            error?.error?.message ||
            'Employee status could not be updated.';

        }

      });

  }


  // ======================================================
  // GET EMPLOYEE NAME
  // ======================================================

  getEmployeeName(
    employee: any
  ): string {

    return (

      employee?.name ||

      employee?.employee_name ||

      '—'

    );

  }


  // ======================================================
  // GET EMPLOYEE EMAIL
  // ======================================================

  getEmployeeEmail(
    employee: any
  ): string {

    return (

      employee?.email ||

      employee?.employee_email ||

      '—'

    );

  }


  // ======================================================
  // GET EMPLOYEE MOBILE
  // ======================================================

  getEmployeeMobile(
    employee: any
  ): string {

    return (
      employee?.mobile ||
      employee?.phone ||
      employee?.mobile_number ||
      '—'
    );

  }


  // ======================================================
  // GET EMPLOYEE ID
  // ======================================================

  getEmployeeId(
    employee: any
  ): number | string {

    return (

      employee?.admin_id ??

      employee?.employee_id ??

      employee?.id ??

      '—'

    );

  }


  // ======================================================
  // GET STATUS
  // ======================================================

  getEmployeeStatus(
    employee: any
  ): string {

    return (

      employee?.status ||

      'Active'

    );

  }


  // ======================================================
  // TRACK BY
  // ======================================================

  trackByEmployeeId(
    index: number,
    employee: any
  ): number | string {

    return (

      employee?.admin_id ??

      employee?.employee_id ??

      employee?.id ??

      index

    );

  }

}