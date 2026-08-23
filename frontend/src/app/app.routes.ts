import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { CarDetailsComponent } from './pages/customer/car-details/car-details.component';


export const routes: Routes = [


  // =====================================================
  // CUSTOMER WEBSITE
  // =====================================================

  {

    path: '',

    loadComponent: () =>
      import(
        './layout/customer-layout/customer-layout.component'
      ).then(
        m => m.CustomerLayoutComponent
      ),

    children: [


      // =================================================
      // CUSTOMER HOME
      // /
      // =================================================

      {

        path: '',

        loadComponent: () =>
          import(
            './pages/customer/home/home.component'
          ).then(
            m => m.HomeComponent
          )

      },


      // =================================================
      // BUY CAR
      // /buy-car
      // =================================================

      // Agar BuyCarComponent available hai to ise uncomment

      /*
      {

        path: 'buy-car',

        loadComponent: () =>
          import(
            './pages/customer/buy-car/buy-car.component'
          ).then(
            m => m.BuyCarComponent
          )

      },
      */


      // =================================================
      // SELL CAR
      // /sell-car
      // =================================================

      {

        path: 'sell-car',

        loadComponent: () =>
          import(
            './pages/customer/sell-car/sell-car.component'
          ).then(
            m => m.SellCarComponent
          )

      },


      // =================================================
      // UPGRADE / EXCHANGE
      // /exchange
      // =================================================

      {

        path: 'exchange',

        loadComponent: () =>
          import(
            './pages/customer/exchange/exchange.component'
          ).then(
            m => m.ExchangeComponent
          )

      },


      // =================================================
      // BOOK INSPECTION
      // /book-inspection
      // =================================================

      
      {

        path: 'book-inspection',

        loadComponent: () =>
          import(
            './pages/customer/book-inspection/book-inspection.component'
          ).then(
            m => m.BookInspectionComponent
          )

      },
      


      // =================================================
      // ABOUT
      // /about
      // =================================================

      
      {

        path: 'about',

        loadComponent: () =>
          import(
            './pages/customer/about/about.component'
          ).then(
            m => m.AboutComponent
          )

      },
      


      // =================================================
      // CAR DETAILS
      // /car/:id
      // =================================================

      {

        path: 'car/:id',

        component: CarDetailsComponent

      }

    ]

  },


  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  {

    path: 'login',

    loadComponent: () =>
      import(
        './pages/login/login.component'
      ).then(
        m => m.LoginComponent
      )

  },


  // =====================================================
  // ADMIN PANEL
  // =====================================================

  {

    path: 'admin',

    canActivate: [

      authGuard

    ],

    canActivateChild: [

      authGuard

    ],

    loadComponent: () =>
      import(
        './layout/admin-layout/admin-layout.component'
      ).then(
        m => m.AdminLayoutComponent
      ),

    children: [


      // ================================================
      // ADMIN DASHBOARD
      // /admin/dashboard
      // ================================================

      {

        path: 'dashboard',

        loadComponent: () =>
          import(
            './pages/admin-dashboard/admin-dashboard.component'
          ).then(
            m => m.AdminDashboardComponent
          )

      },


      // ================================================
      // ADD VEHICLE
      // /admin/vehicles/add
      // ================================================

      {

        path: 'vehicles/add',

        loadComponent: () =>
          import(
            './pages/add-vehicle/add-vehicle.component'
          ).then(
            m => m.AddVehicleComponent
          )

      },


      // ================================================
      // EDIT VEHICLE
      // /admin/vehicles/edit/:carId
      // ================================================

      {

        path: 'vehicles/edit/:carId',

        loadComponent: () =>
          import(
            './pages/edit-vehicle/edit-vehicle.component'
          ).then(
            m => m.EditVehicleComponent
          )

      },


      // ================================================
      // ALL VEHICLES
      // /admin/vehicles
      // ================================================

      {

        path: 'vehicles',

        loadComponent: () =>
          import(
            './pages/vehicles/vehicles.component'
          ).then(
            m => m.VehiclesComponent
          )

      },


      // ================================================
      // REPORT UNLOCK REQUESTS
      // ================================================

      {

        path: 'report-unlock-requests',

        loadComponent: () =>
          import(
            './pages/report-unlock-requests/report-unlock-requests.component'
          ).then(
            m => m.ReportUnlockRequestsComponent
          )

      },


      // ================================================
      // TEST DRIVE REQUESTS
      // ================================================

      {

        path: 'test-drive-requests',

        loadComponent: () =>
          import(
            './pages/test-drive-requests/test-drive-requests.component'
          ).then(
            m => m.TestDriveRequestsComponent
          )

      },


      // ================================================
      // FINANCE REQUESTS
      // ================================================

      {

        path: 'finance-requests',

        loadComponent: () =>
          import(
            './pages/finance-requests/finance-requests.component'
          ).then(
            m => m.FinanceRequestsComponent
          )

      },


      // ================================================
      // SELL CAR REQUESTS
      // ================================================

      {

        path: 'sell-car-requests',

        loadComponent: () =>
          import(
            './pages/sell-car-requests/sell-car-requests.component'
          ).then(
            m => m.SellCarRequestsComponent
          )

      },


      // ================================================
      // EXCHANGE REQUESTS
      // ================================================

      {

        path: 'exchange-requests',

        loadComponent: () =>
          import(
            './pages/exchange-requests/exchange-requests.component'
          ).then(
            m => m.ExchangeRequestsComponent
          )

      },


      // ================================================
      // LOAN REQUESTS
      // ================================================

      {

        path: 'loan-requests',

        loadComponent: () =>
          import(
            './pages/loan-requests/loan-requests.component'
          ).then(
            m => m.LoanRequestsComponent
          )

      },


      // ================================================
      // INSPECTION BOOKINGS
      // ================================================

      {

        path: 'inspection-bookings',

        loadComponent: () =>
          import(
            './pages/inspection-bookings/inspection-bookings.component'
          ).then(
            m => m.InspectionBookingsComponent
          )

      },


      // ================================================
      // INSPECTION REPORTS
      // ================================================

      {

        path: 'inspection-reports',

        loadComponent: () =>
          import(
            './pages/reports/reports.component'
          ).then(
            m => m.ReportsComponent
          )

      },


      // ================================================
      // ADMIN DEFAULT
      // /admin
      // ↓
      // /admin/dashboard
      // ================================================

      {

        path: '',

        redirectTo: 'dashboard',

        pathMatch: 'full'

      }

    ]

  },


  // =====================================================
  // UNKNOWN URL
  // =====================================================

  {

    path: '**',

    redirectTo: ''

  }

];