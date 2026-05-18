import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxManagementComponent } from './tax-management.component';

describe('TaxManagementComponent', () => {
  let component: TaxManagementComponent;
  let fixture: ComponentFixture<TaxManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
