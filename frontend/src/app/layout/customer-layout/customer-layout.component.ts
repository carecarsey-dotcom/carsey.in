import {
  Component,
  effect,
  HostListener,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';


@Component({
  selector: 'app-customer-layout',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './customer-layout.component.html',

  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent {


  // =====================================================
  // CURRENT YEAR
  // =====================================================

  currentYear =
    new Date().getFullYear();


  // =====================================================
  // MOBILE MENU
  // =====================================================

  mobileMenuOpen =
    signal(false);


  // =====================================================
  // DARK MODE
  // =====================================================

  darkMode =
    signal(false);


  // =====================================================
  // NAVBAR SCROLL STATE
  // =====================================================

  isScrolled =
    signal(false);


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    effect(() => {

      if (this.darkMode()) {

        document.documentElement.classList.add(
          'black'
        );

      } else {

        document.documentElement.classList.remove(
          'black'
        );

      }

    });

  }


  // =====================================================
  // PAGE SCROLL
  // =====================================================

  @HostListener('window:scroll')
  onWindowScroll(): void {

    if (window.scrollY > 30) {

      this.isScrolled.set(true);

    } else {

      this.isScrolled.set(false);

    }

  }


  // =====================================================
  // TOGGLE MOBILE MENU
  // =====================================================

  toggleMobileMenu(): void {

    this.mobileMenuOpen.update(
      value => !value
    );

  }


  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  closeMobileMenu(): void {

    this.mobileMenuOpen.set(false);

  }


  // =====================================================
  // TOGGLE DARK MODE
  // =====================================================

  toggleDarkMode(): void {

    this.darkMode.update(
      value => !value
    );

  }

}