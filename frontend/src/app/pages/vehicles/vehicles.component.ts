import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Vehicle, VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  vehicles: Vehicle[] = [];
  deletedVehicles: Vehicle[] = [];

  searchText = '';
  loading = false;
  loadingDeleted = false;
  errorMessage = '';

  deletingVehicleId: number | null = null;
  restoringVehicleId: number | null = null;

  viewMode: 'active' | 'deleted' = 'active';

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehicleService.getVehicles().subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.vehicles = response.data?.vehicles ?? [];
        } else {
          this.errorMessage =
            response?.message || 'Unable to load vehicles.';
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load vehicles.';
        this.loading = false;
      }
    });
  }

  loadDeletedVehicles(): void {
    this.loadingDeleted = true;
    this.errorMessage = '';

    this.vehicleService.getDeletedVehicles().subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.deletedVehicles = response.data?.vehicles ?? [];
        } else {
          this.errorMessage =
            response?.message || 'Unable to load deleted vehicles.';
        }

        this.loadingDeleted = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load deleted vehicles.';
        this.loadingDeleted = false;
      }
    });
  }

  showActiveCars(): void {
    this.viewMode = 'active';
    this.searchText = '';
    this.errorMessage = '';

    if (!this.vehicles.length) {
      this.loadVehicles();
    }
  }

  showDeletedCars(): void {
    this.viewMode = 'deleted';
    this.searchText = '';
    this.loadDeletedVehicles();
  }

  /**
   * Display ID rules:
   * - Sell Car: source_type = 'sell-car', source_sell_id = 1 -> SCR-100001
   * - Normal vehicle: booking_id = 64 -> CAR-000064
   *
   * car_id is deliberately not used to generate an SCR ID because it is
   * different from the Sell Car request ID.
   */
  getBookingCode(vehicle: Vehicle): string {
    const item = vehicle as any;

    // The actual vehicles API returns source_type and source_sell_id
    // for Sell Car vehicles.
    const sourceType = String(item?.source_type ?? '').trim().toLowerCase();

    if (sourceType === 'sell-car') {
      const sellId = Number(item?.source_sell_id);

      if (Number.isInteger(sellId) && sellId > 0) {
        return `SCR-${String(100000 + sellId).padStart(6, '0')}`;
      }

      // It is a Sell Car vehicle, but its request ID is missing/invalid.
      return '-';
    }

    // Use a display ID if another backend endpoint provides one.
    const displayId = item?.display_id ?? item?.displayId;

    if (
      displayId !== undefined &&
      displayId !== null &&
      String(displayId).trim() !== ''
    ) {
      return String(displayId).trim();
    }

    // Preserve the existing normal vehicle booking ID behavior.
    const rawBookingId = item?.booking_id;

    if (
      rawBookingId === undefined ||
      rawBookingId === null ||
      String(rawBookingId).trim() === ''
    ) {
      return '-';
    }

    const bookingId = String(rawBookingId).trim();

    if (bookingId.startsWith('CAR-')) {
      return bookingId;
    }

    const numericPart = Number(bookingId);

    if (Number.isFinite(numericPart)) {
      return `CAR-${String(numericPart).padStart(6, '0')}`;
    }

    return bookingId;
  }

  get filteredVehicles(): Vehicle[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.vehicles;
    }

    return this.vehicles.filter((vehicle: Vehicle) => {
      const item = vehicle as any;
      const values = [
        vehicle.car_id,
        vehicle.booking_id,
        item?.source_type,
        item?.source_sell_id,
        item?.display_id,
        item?.displayId,
        vehicle.brand,
        vehicle.model,
        vehicle.variant,
        vehicle.city,
        vehicle.status,
        vehicle.manufacturing_year,
        vehicle.price,
        vehicle.odometer
      ];

      return values.some((value) =>
        String(value ?? '').toLowerCase().includes(search)
      );
    });
  }

  get filteredDeletedVehicles(): Vehicle[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.deletedVehicles;
    }

    return this.deletedVehicles.filter((vehicle: Vehicle) => {
      const item = vehicle as any;
      const values = [
        vehicle.car_id,
        vehicle.booking_id,
        item?.source_type,
        item?.source_sell_id,
        item?.display_id,
        item?.displayId,
        vehicle.brand,
        vehicle.model,
        vehicle.variant,
        vehicle.city,
        vehicle.status,
        vehicle.manufacturing_year,
        vehicle.price,
        vehicle.odometer
      ];

      return values.some((value) =>
        String(value ?? '').toLowerCase().includes(search)
      );
    });
  }

  deleteVehicle(vehicle: Vehicle): void {
    const carId = Number(vehicle?.car_id);

    if (!Number.isInteger(carId) || carId <= 0) {
      this.errorMessage = 'Invalid vehicle ID.';
      return;
    }

    const confirmed = window.confirm(
      'This will move the vehicle to Deleted Cars.\n\n' +
      'The vehicle data, images and inspection records will be kept and ' +
      'the vehicle can be restored later.\n\n' +
      'Do you want to continue?'
    );

    if (!confirmed) {
      return;
    }

    this.deletingVehicleId = carId;
    this.errorMessage = '';

    this.vehicleService.deleteVehicle(carId).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.vehicles = this.vehicles.filter(
            (item) => Number(item.car_id) !== carId
          );
        } else {
          this.errorMessage =
            response?.message || 'Unable to delete vehicle.';
        }

        this.deletingVehicleId = null;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to delete vehicle.';
        this.deletingVehicleId = null;
      }
    });
  }

  restoreVehicle(vehicle: Vehicle): void {
    const carId = Number(vehicle?.car_id);

    if (!Number.isInteger(carId) || carId <= 0) {
      this.errorMessage = 'Invalid vehicle ID.';
      return;
    }

    const confirmed = window.confirm(
      'Restore this vehicle to Active Cars?\n\n' +
      'The vehicle will be restored with its existing data, images and ' +
      'previous status/publish state.'
    );

    if (!confirmed) {
      return;
    }

    this.restoringVehicleId = carId;
    this.errorMessage = '';

    this.vehicleService.restoreVehicle(carId).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.deletedVehicles = this.deletedVehicles.filter(
            (item) => Number(item.car_id) !== carId
          );

          // Refresh Active Cars so the restored vehicle appears immediately
          // with its existing status/publish state.
          this.loadVehicles();
        } else {
          this.errorMessage =
            response?.message || 'Unable to restore vehicle.';
        }

        this.restoringVehicleId = null;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to restore vehicle.';
        this.restoringVehicleId = null;
      }
    });
  }
}
