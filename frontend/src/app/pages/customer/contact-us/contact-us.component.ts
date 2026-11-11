import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent {

  // META PIXEL - CONTACT EVENT
  trackMetaContact(): void {
    const fbq = (window as any).fbq;

    if (typeof fbq === 'function') {
      fbq('track', 'Contact', {
        content_name: 'Contact Support',
        content_category: 'Customer Support'
      });
    }
  }

}