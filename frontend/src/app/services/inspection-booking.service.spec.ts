import { TestBed } from '@angular/core/testing';

import { InspectionBookingService } from './inspection-booking.service';

describe('InspectionBookingService', () => {
  let service: InspectionBookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InspectionBookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
