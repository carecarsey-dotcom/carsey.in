import {
  Component,
  inject
} from '@angular/core';

import {
  DashboardData,
  DashboardService
} from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {

  private readonly dashboardService =
    inject(DashboardService);

  dashboard: DashboardData = {
    activeListings: 0,
    soldCars: 0,
    unlockRequests: 0,
    testDriveRequests: 0,
    financeRequests: 0,
    sellCarRequests: 0,
    exchangeRequests: 0,
    loanRequests: 0,
    inspectionBookings: 0
  };

  loading = true;

  errorMessage = '';

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.loading = true;

    this.errorMessage = '';

    this.dashboardService
      .getDashboard()
      .subscribe({

        next: (response) => {

          console.log(
            'Dashboard Response:',
            response
          );

          if (response.success) {
            this.dashboard =
              response.data.dashboard;
          }

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Dashboard Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Unable to load dashboard data.';

          this.loading = false;

        }

      });

  }

}