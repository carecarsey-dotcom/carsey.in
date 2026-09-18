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

  getBookingCode(vehicle: Vehicle): string {
    const rawBookingId =
      vehicle?.booking_id !== undefined && vehicle?.booking_id !== null
        ? String(vehicle.booking_id)
        : '';

    if (!rawBookingId) {
      return '-';
    }

    if (rawBookingId.startsWith('CAR-')) {
      return rawBookingId;
    }

    const numericPart = Number(rawBookingId);

    if (Number.isFinite(numericPart)) {
      return `CAR-${String(numericPart).padStart(6, '0')}`;
    }

    return rawBookingId;
  }

  get filteredVehicles(): Vehicle[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.vehicles;
    }

    return this.vehicles.filter((vehicle: Vehicle) => {
      const values = [
        vehicle.car_id,
        vehicle.booking_id,
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
      const values = [
        vehicle.car_id,
        vehicle.booking_id,
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
      'This will move the vehicle to Deleted Cars.\\n\\n' +
      'The vehicle data, images and inspection records will be kept and ' +
      'the vehicle can be restored later.\\n\\n' +
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
      'Restore this vehicle to Active Cars?\\n\\n' +
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
