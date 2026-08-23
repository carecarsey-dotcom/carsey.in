import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Vehicle,
  VehicleService
} from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicles',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './vehicles.component.html',

  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit {

  private vehicleService =
    inject(VehicleService);

  vehicles: Vehicle[] = [];

  searchText = '';

  loading = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {

    this.loading = true;

    this.errorMessage = '';

    this.vehicleService
      .getVehicles()
      .subscribe({

        next: (response: any) => {

          console.log(
            'Vehicles Response:',
            response
          );

          if (response.success) {

            this.vehicles =
              response.data?.vehicles ?? [];

          } else {

            this.errorMessage =
              response.message ||
              'Unable to load vehicles.';
          }

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Vehicle API Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load vehicles.';

          this.loading = false;
        }

      });
  }

  get filteredVehicles(): Vehicle[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      return this.vehicles;
    }

    return this.vehicles.filter(
      vehicle =>
        vehicle.brand
          ?.toLowerCase()
          .includes(search)

        ||

        vehicle.model
          ?.toLowerCase()
          .includes(search)

        ||

        vehicle.city
          ?.toLowerCase()
          .includes(search)
    );
  }

}