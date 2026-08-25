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


export class VehiclesComponent
  implements OnInit {


  private vehicleService =
    inject(VehicleService);


  vehicles: Vehicle[] = [];


  searchText = '';


  loading = false;


  errorMessage = '';


  // ======================================================
  // DELETE VEHICLE LOADING ID
  // ======================================================

  deletingVehicleId: number | null = null;



  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    this.loadVehicles();

  }



  // ======================================================
  // LOAD VEHICLES
  // ======================================================

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


          if (response?.success) {

            this.vehicles =
              response.data?.vehicles ?? [];

          }

          else {

            this.errorMessage =
              response?.message ||
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



  // ======================================================
  // FILTER VEHICLES
  // ======================================================

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



  // ======================================================
  // DELETE VEHICLE
  // ======================================================

  deleteVehicle(
    vehicle: Vehicle
  ): void {


    // ----------------------------------------------------
    // CHECK VEHICLE ID
    // ----------------------------------------------------

    if (
      vehicle.car_id === null ||
      vehicle.car_id === undefined ||
      Number(vehicle.car_id) <= 0
    ) {

      console.error(
        'Vehicle ID is missing.'
      );

      return;

    }



    // ----------------------------------------------------
    // VEHICLE NAME
    // ----------------------------------------------------

    const vehicleName =

      `${vehicle.brand || ''} ${vehicle.model || ''}`
        .trim();



    // ----------------------------------------------------
    // CONFIRM DELETE
    // ----------------------------------------------------

    const confirmed =

      window.confirm(

        `Are you sure you want to delete ${
          vehicleName || 'this vehicle'
        }?\n\n` +

        `Vehicle ID: ${vehicle.car_id}\n\n` +

        `This action will permanently delete the vehicle.`

      );



    // ----------------------------------------------------
    // USER CANCELLED
    // ----------------------------------------------------

    if (!confirmed) {

      return;

    }



    // ----------------------------------------------------
    // SET DELETE LOADING
    // ----------------------------------------------------

    this.deletingVehicleId =
      Number(vehicle.car_id);

    this.errorMessage = '';



    // ----------------------------------------------------
    // CALL DELETE API
    // ----------------------------------------------------

    this.vehicleService
      .deleteVehicle(
        Number(vehicle.car_id)
      )
      .subscribe({

        // ==================================================
        // SUCCESS
        // ==================================================

        next: (response: any) => {

          console.log(
            'Delete Vehicle Response:',
            response
          );


          // ------------------------------------------------
          // DELETE SUCCESS
          // ------------------------------------------------

          if (
            response?.success
          ) {


            // ----------------------------------------------
            // REMOVE VEHICLE FROM FRONTEND LIST
            // ----------------------------------------------

            this.vehicles =

              this.vehicles.filter(

                item =>
                  Number(item.car_id) !==
                  Number(vehicle.car_id)

              );


            console.log(

              `Vehicle ${vehicle.car_id} deleted successfully.`

            );


          }


          // ------------------------------------------------
          // DELETE FAILED
          // ------------------------------------------------

          else {

            this.errorMessage =

              response?.message ||

              'Unable to delete vehicle.';

          }


          // ------------------------------------------------
          // REMOVE DELETE LOADING
          // ------------------------------------------------

          this.deletingVehicleId =
            null;

        },


        // ==================================================
        // ERROR
        // ==================================================

        error: (error) => {

          console.error(
            'Delete Vehicle API Error:',
            error
          );


          this.errorMessage =

            error?.error?.message ||

            'Unable to delete vehicle.';


          this.deletingVehicleId =
            null;

        }

      });

  }

}