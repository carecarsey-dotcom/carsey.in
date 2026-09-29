import { CommonModule } from '@angular/common';

import {
  AfterViewInit,
  Component
} from '@angular/core';

import { RouterLink } from '@angular/router';

import AOS from 'aos';

@Component({
  selector: 'app-about-service',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './about-service.component.html'
})
export class AboutServiceComponent
  implements AfterViewInit {

  ngAfterViewInit(): void {

    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out-cubic',
      offset: 80,
      mirror: false,
      disable: false
    });

    setTimeout(() => {
      AOS.refreshHard();
    }, 100);
  }
}
