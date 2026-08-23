import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionBookingsComponent } from './inspection-bookings.component';

describe('InspectionBookingsComponent', () => {
  let component: InspectionBookingsComponent;
  let fixture: ComponentFixture<InspectionBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
