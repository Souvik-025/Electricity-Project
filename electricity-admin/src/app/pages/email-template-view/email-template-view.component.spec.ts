import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplateViewComponent } from './email-template-view.component';

describe('EmailTemplateViewComponent', () => {
  let component: EmailTemplateViewComponent;
  let fixture: ComponentFixture<EmailTemplateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplateViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
