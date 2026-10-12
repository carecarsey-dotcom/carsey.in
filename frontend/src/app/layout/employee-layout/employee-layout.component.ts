import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-layout.component.html'
})
export class EmployeeLayoutComponent {
  sidebarOpen = true;
  isMobile = false;

  constructor(private router: Router) { this.checkScreenSize(); }

  @HostListener('window:resize')
  onResize(): void { this.checkScreenSize(); }

  private checkScreenSize(): void {
    if (typeof window === 'undefined') return;
    this.isMobile = window.innerWidth <= 700;
    this.sidebarOpen = !this.isMobile;
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebarOnMobile(): void { if (this.isMobile) this.sidebarOpen = false; }
  goToDashboard(): void { this.router.navigate(['/employee/dashboard']); }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      ['token','adminToken','authToken','user','admin','employee'].forEach(key => localStorage.removeItem(key));
    }
    this.router.navigate(['/login']);
  }
}
