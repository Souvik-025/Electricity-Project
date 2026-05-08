import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerCallbackComponent } from './customer-callback.component';

describe('CustomerCallbackComponent', () => {
  let component: CustomerCallbackComponent;
  let fixture: ComponentFixture<CustomerCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerCallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
