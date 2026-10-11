import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  features = [
    {
      icon: '🔍',
      title: 'Clear Information',
      description: 'Explore vehicle information to help you make more informed car decisions.'
    },
    {
      icon: '🤝',
      title: 'Customer Focused',
      description: 'A simple, customer-focused experience for buying, selling and exchanging cars.'
    },
    {
      icon: '🛡️',
      title: 'Transparency',
      description: 'We aim to make each step easier to understand with a transparent process.'
    },
    {
      icon: '🚘',
      title: 'Convenience',
      description: 'Access multiple vehicle-related services through one digital platform.'
    }
  ];

  services = [
    {
      icon: '🚗',
      title: 'Buy a Car',
      description: 'Explore available cars and review vehicle details before making your next move.'
    },
    {
      icon: '💰',
      title: 'Sell Your Car',
      description: 'Submit your car details and start the process of selling your existing vehicle.'
    },
    {
      icon: '🔄',
      title: 'Upgrade / Exchange',
      description: 'Explore exchange options when you are ready to move to another vehicle.'
    },
    {
      icon: '🔎',
      title: 'Vehicle Inspection',
      description: 'Request vehicle inspection services to get more information about a car.'
    },
    {
      icon: '📋',
      title: 'Inspection Reports',
      description: 'Access available inspection report information to support your decision-making.'
    },
    {
      icon: '💳',
      title: 'Finance Enquiry',
      description: 'Submit a finance enquiry to explore vehicle financing options.'
    }
  ];

  steps = [
    {
      number: '01',
      title: 'Explore Your Options',
      description: 'Browse available vehicles or choose the service you need.'
    },
    {
      number: '02',
      title: 'Share Your Details',
      description: 'Submit the relevant vehicle information or service request.'
    },
    {
      number: '03',
      title: 'Review the Information',
      description: 'Review the available details and understand the next steps.'
    },
    {
      number: '04',
      title: 'Move Forward',
      description: 'Continue with buying, selling, exchanging or inspecting a vehicle.'
    }
  ];
}
