import { CommonModule } from '@angular/common';

import {
  Component,
  HostListener
} from '@angular/core';

import {
  Router,
  RouterModule
} from '@angular/router';

@Component({
  selector: 'app-employee-layout',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './employee-layout.component.html'
})
export class EmployeeLayoutComponent {

  sidebarOpen = true;

  isMobile = false;

  constructor(
    private router: Router
  ) {
    this.checkScreenSize();
  }

  // ======================================================
  // SCREEN SIZE
  // ======================================================

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isMobile = window.innerWidth <= 700;

    if (this.isMobile) {
      this.sidebarOpen = false;
    } else {
      this.sidebarOpen = true;
    }
  }

  // ======================================================
  // SIDEBAR
  // ======================================================

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  goToDashboard(): void {
    this.router.navigate(['/employee/dashboard']);
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  logout(): void {

    if (typeof localStorage !== 'undefined') {

      localStorage.removeItem('token');

      localStorage.removeItem('adminToken');

      localStorage.removeItem('authToken');

      localStorage.removeItem('user');

      localStorage.removeItem('admin');

      localStorage.removeItem('employee');
    }

    this.router.navigate(['/login']);
  }
}