import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SellCarRequest, SellCarService } from '../../services/sell-car.service';
import { EmployeeService } from '../../services/employee.service';

interface Employee { admin_id: number; name: string; email?: string; status: string; role?: string; }

@Component({
  selector: 'app-sell-car-requests', standalone: true, imports: [CommonModule],
  templateUrl: './sell-car-requests.component.html', styleUrl: './sell-car-requests.component.css'
})
export class SellCarRequestsComponent implements OnInit {
  private sellCarService = inject(SellCarService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  requests: SellCarRequest[] = [];
  employees: Employee[] = [];
  loading = false;
  loadingEmployees = false;
  errorMessage = '';
  successMessage = '';
  updatingSellId: number | null = null;
  assigningSellId: number | null = null;
  selectedEmployees: Record<number, number | null> = {};

  ngOnInit(): void { this.loadRequests(); this.loadEmployees(); }

  getDisplayId(sellId: number | string | null | undefined): string {
    const id = Number(sellId);
    return Number.isInteger(id) && id > 0 ? `SCR-${String(100000 + id).padStart(6, '0')}` : 'SCR-—';
  }

  getWorkflowStatus(request: SellCarRequest): string {
    if (request.workflow_status) return request.workflow_status;
    if (request.status === 'Approved' || request.status === 'Rejected') return request.status;
    return request.assigned_employee_id ? 'Assigned' : 'Pending Assignment';
  }

  getAssignedEmployeeName(request: SellCarRequest): string {
    const employeeId = Number(request.assigned_employee_id);
    if (!employeeId) return 'Not Assigned';

    const employee = this.employees.find(
      item => Number(item.admin_id) === employeeId
    );

    return employee?.name || `Employee ID: ${employeeId}`;
  }

  loadRequests(): void {
    this.loading = true; this.errorMessage = '';
    this.sellCarService.getRequests().subscribe({
      next: response => {
        if (response.success) this.requests = response.data?.requests ?? [];
        else this.errorMessage = response.message || 'Unable to load sell car requests.';
        this.loading = false;
      },
      error: error => {
        console.error('Sell Car API Error:', error);
        this.errorMessage = error?.error?.message || 'Unable to load sell car requests.';
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;
    this.employeeService.getEmployees().subscribe({
      next: (response: any) => {
        const list = response?.data?.employees ?? [];
        this.employees = list.filter((e: Employee) => e.role === 'Employee' && e.status === 'Active');
        this.loadingEmployees = false;
      },
      error: (error: any) => {
        console.error('Load Employees Error:', error);
        this.errorMessage = error?.error?.message || 'Unable to load employees.';
        this.loadingEmployees = false;
      }
    });
  }

  onEmployeeChange(sellId: number, event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.selectedEmployees[sellId] = id > 0 ? id : null;
  }

  assignEmployee(request: SellCarRequest): void {
    const sellId = Number(request.sell_id), employeeId = this.selectedEmployees[sellId];
    if (!sellId || !employeeId) { this.errorMessage = 'Please select an employee first.'; this.successMessage = ''; return; }
    if (this.assigningSellId !== null) return;
    this.errorMessage = ''; this.successMessage = ''; this.assigningSellId = sellId;
    this.sellCarService.assignEmployee(sellId, employeeId).subscribe({
      next: response => {
        if (response.success) { this.successMessage = response.message || 'Employee assigned successfully.'; this.loadRequests(); }
        else this.errorMessage = response.message || 'Unable to assign employee.';
        this.assigningSellId = null;
      },
      error: error => { this.errorMessage = error?.error?.message || 'Unable to assign employee.'; this.assigningSellId = null; }
    });
  }

  approve(request: SellCarRequest): void {
    if (this.getWorkflowStatus(request) !== 'Pending Approval') {
      this.errorMessage = 'Only requests pending Admin approval can be approved.'; return;
    }
    if (!window.confirm('Approve this Sell Car request? Vehicle publishing will be a separate step.')) return;
    this.updateStatus(request, 'Approved');
  }

  publishVehicle(request: SellCarRequest): void {
    if (this.getWorkflowStatus(request) !== 'Approved') {
      this.errorMessage = 'Approve the request before publishing the vehicle.'; return;
    }
    this.router.navigate(['/admin/vehicles/add'], { queryParams: { source: 'sell-car', sellId: request.sell_id } });
  }

  reject(request: SellCarRequest): void {
    if (this.getWorkflowStatus(request) !== 'Pending Approval') {
      this.errorMessage = 'Only requests pending Admin approval can be rejected.'; return;
    }
    if (window.confirm('Are you sure you want to reject this Sell Car request?')) this.updateStatus(request, 'Rejected');
  }

  sendForCorrection(request: SellCarRequest): void {
    if (this.getWorkflowStatus(request) !== 'Pending Approval') {
      this.errorMessage = 'Only requests pending Admin approval can be returned for correction.'; return;
    }
    const note = window.prompt('Enter the correction required from the employee:');
    if (note === null) return;
    if (!note.trim()) { this.errorMessage = 'Please enter a correction note.'; return; }
    this.errorMessage = ''; this.successMessage = ''; this.updatingSellId = request.sell_id;
    this.sellCarService.sendForCorrection(request.sell_id, note.trim()).subscribe({
      next: response => {
        if (response.success) { this.successMessage = response.message || 'Request sent back for correction.'; this.loadRequests(); }
        else this.errorMessage = response.message || 'Unable to send request for correction.';
        this.updatingSellId = null;
      },
      error: error => { this.errorMessage = error?.error?.message || 'Unable to send request for correction.'; this.updatingSellId = null; }
    });
  }

  private updateStatus(request: SellCarRequest, status: 'Approved' | 'Rejected'): void {
    this.updatingSellId = request.sell_id; this.errorMessage = ''; this.successMessage = '';
    this.sellCarService.updateStatus(request.sell_id, status).subscribe({
      next: response => {
        if (response.success) { this.successMessage = response.message || `Request ${status.toLowerCase()}.`; this.loadRequests(); }
        else this.errorMessage = response.message || 'Unable to update sell car status.';
        this.updatingSellId = null;
      },
      error: error => { this.errorMessage = error?.error?.message || 'Unable to update sell car status.'; this.updatingSellId = null; }
    });
  }

  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'approved & published' || s === 'published') return 'bg-green-100 text-green-700';
    if (s === 'rejected') return 'bg-red-100 text-red-700';
    if (s === 'assigned' || s === 'in progress') return 'bg-blue-100 text-blue-700';
    if (s === 'pending approval' || s === 'pending admin approval') return 'bg-purple-100 text-purple-700';
    if (s === 'correction required') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  getImageUrl(image?: string): string {
    if (!image) return '';
    if (/^https?:\/\//i.test(image)) return image;
    const path = image.startsWith('/') ? image : `/${image}`;
    const base = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000' : 'https://api.carsey.in';
    return `${base}${path}`;
  }

  getRequestImages(request: SellCarRequest): { label: string; path?: string }[] {
    return [
      { label: 'Front', path: request.front_image }, { label: 'Back', path: request.back_image },
      { label: 'Left Side', path: request.left_image }, { label: 'Right Side', path: request.right_image },
      { label: 'Interior – Front', path: request.interior_front_image }, { label: 'Interior – Rear', path: request.interior_rear_image },
      { label: 'Open Dicky', path: request.open_dicky_image }, { label: 'Open Bonnet', path: request.open_bonnet_image },
      { label: 'Odometer', path: request.odometer_image }, { label: 'Dashboard', path: request.dashboard_image }
    ];
  }
}
