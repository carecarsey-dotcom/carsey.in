import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  // =====================================================
  // WHY CARSEY
  // =====================================================

  features = [
    {
      icon: '🔍',
      title: 'Professional Inspection',
      description:
        'Every vehicle goes through a detailed inspection process before it is listed on Carsey.in.'
    },
    {
      icon: '📋',
      title: 'Transparent Reports',
      description:
        'We provide clear vehicle information and inspection details so customers can make confident decisions.'
    },
    {
      icon: '💰',
      title: 'Fair Pricing',
      description:
        'Our platform focuses on transparent and competitive pricing for buyers and sellers.'
    },
    {
      icon: '🤝',
      title: 'Customer First',
      description:
        'From buying and selling to exchange and inspection booking, we keep the customer experience simple.'
    }
  ];


  // =====================================================
  // SERVICES
  // =====================================================

  services = [
    {
      icon: '🚗',
      title: 'Buy a Car',
      description:
        'Explore professionally inspected used cars and find a vehicle that fits your requirements and budget.'
    },
    {
      icon: '💸',
      title: 'Sell Your Car',
      description:
        'Submit your vehicle details and get connected with our team for the selling process.'
    },
    {
      icon: '🔄',
      title: 'Upgrade / Exchange',
      description:
        'Exchange your existing vehicle and move towards your preferred car with a simple request process.'
    },
    {
      icon: '🔧',
      title: 'Book Inspection',
      description:
        'Schedule a vehicle inspection at a convenient date and time.'
    }
  ];


  // =====================================================
  // PROCESS
  // =====================================================

  steps = [
    {
      number: '01',
      title: 'Choose Your Service',
      description:
        'Buy, sell, exchange your vehicle or book an inspection according to your requirement.'
    },
    {
      number: '02',
      title: 'Submit Your Details',
      description:
        'Provide the required vehicle and customer information through our simple forms.'
    },
    {
      number: '03',
      title: 'Our Team Reviews',
      description:
        'Our team reviews the submitted information and gets in touch with you.'
    },
    {
      number: '04',
      title: 'Complete Your Journey',
      description:
        'Move forward with the next step of your vehicle buying, selling, exchange or inspection journey.'
    }
  ];

}