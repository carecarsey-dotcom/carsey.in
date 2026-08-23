import {
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';


@Component({

  selector: 'app-admin-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './admin-layout.component.html',

  styleUrl:
    './admin-layout.component.css'

})


export class AdminLayoutComponent {


  // ==========================================
  // ROUTER
  // ==========================================

  private readonly router =
    inject(Router);


  // ==========================================
  // SIDEBAR
  // ==========================================

  sidebarOpen = true;


  // ==========================================
  // TOGGLE SIDEBAR
  // ==========================================

  toggleSidebar(): void {

    this.sidebarOpen =
      !this.sidebarOpen;

  }


  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    console.log(
      'Logging out...'
    );


    // ==========================================
    // REMOVE AUTH TOKEN
    // ==========================================

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'authToken'
    );

    localStorage.removeItem(
      'accessToken'
    );


    // ==========================================
    // REMOVE USER DATA
    // ==========================================

    localStorage.removeItem(
      'user'
    );

    localStorage.removeItem(
      'admin'
    );

    localStorage.removeItem(
      'isLoggedIn'
    );


    // ==========================================
    // CLEAR SESSION
    // ==========================================

    sessionStorage.clear();


    // ==========================================
    // GO TO HOME PAGE
    // ==========================================

    this.router.navigate(
      ['/'],
      {
        replaceUrl: true
      }
    );

  }

}