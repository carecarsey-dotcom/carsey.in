import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRequestsComponent } from './loan-requests.component';

describe('LoanRequestsComponent', () => {
  let component: LoanRequestsComponent;
  let fixture: ComponentFixture<LoanRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
