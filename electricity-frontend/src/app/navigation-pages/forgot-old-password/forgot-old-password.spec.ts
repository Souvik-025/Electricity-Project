import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotOldPassword } from './forgot-old-password';

describe('ForgotOldPassword', () => {
  let component: ForgotOldPassword;
  let fixture: ComponentFixture<ForgotOldPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotOldPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotOldPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
