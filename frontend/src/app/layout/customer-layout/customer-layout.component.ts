import { Component, effect, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.css'
})
export class CustomerLayoutComponent {
  // Current year for footer
  currentYear = new Date().getFullYear();

  // Mobile menu state
  mobileMenuOpen = signal(false);

  // Dark mode state
  darkMode = signal(false);

  // Navbar scroll state
  isScrolled = signal(false);

  constructor() {
    effect(() => {
      if (this.darkMode()) {
        document.documentElement.classList.add('black');
      } else {
        document.documentElement.classList.remove('black');
      }
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 30);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleDarkMode(): void {
    this.darkMode.update(value => !value);
  }
}
