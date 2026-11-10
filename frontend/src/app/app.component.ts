import {
  Component
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import {
  filter
} from 'rxjs/operators';

// Meta Pixel Declaration
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

@Component({

  selector: 'app-root',

  standalone: true,

  imports: [
    RouterOutlet
  ],

  templateUrl:
    './app.component.html'

})
export class AppComponent {

  constructor(
    private router: Router
  ) {

    // Meta Pixel PageView Tracking
    this.router.events
      .pipe(

        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )

      )
      .subscribe((event: NavigationEnd) => {

        if (typeof window.fbq === 'function') {

          window.fbq(
            'track',
            'PageView'
          );

          console.log(
            'Meta Pixel PageView:',
            event.urlAfterRedirects
          );

        }

      });

  }

}
