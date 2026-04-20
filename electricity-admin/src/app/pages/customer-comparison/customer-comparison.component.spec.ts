import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerComparisonComponent } from './customer-comparison.component';

describe('CustomerComparisonComponent', () => {
  let component: CustomerComparisonComponent;
  let fixture: ComponentFixture<CustomerComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
