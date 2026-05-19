import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  imports: [
    ContactPerson,
    NeedSupport,
    CommonModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  showDropdown = false;

  // categories = [
  //   { serviceName: 'Allgemeine Frage' },
  //   { serviceName: 'Tarifvergleich / Anbieter' },
  //   { serviceName: 'Kooperation / Partnerschaft' },
  //   { serviceName: 'Sonstiges' },
  // ];
  categories: any[] = [];
  selectedCategory: any = null;

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  selectCategory(item: any, event: Event) {
    event.stopPropagation();

    this.selectedCategory = item;
    this.showDropdown = false;
  }
  formData = {
    salutation: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    customerId: '',
    inquiry: '',
  };

  fieldErrors: any = {};
  isLoggedIn = computed(() => !!this.authService.currentUser()?.user_id);

  ngOnInit() {
    this.fetchCategories();
    if (this.isLoggedIn()) {
      this.authService.fetchCustomer();
    }

    this.authService.getCustomerData().subscribe((data) => {
      if (!data) return;

      this.formData.firstName = data.firstName || '';
      this.formData.lastName = data.lastName || '';
      this.formData.email = data.email || '';
      this.formData.salutation = data.salutation || '';
      this.formData.title = data.title || '';

      console.log('Customer data:', data);

      this.cdr.detectChanges();
      console.log('Customer data updated in DeliveryAddress:', data);
    });
  }

  fetchCategories(): void {
    this.http.post<any>('http://192.168.0.155:8080/fetch-contact-category', {}).subscribe({
      next: (res) => {
        this.categories = res || [];
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  validate(): boolean {
    this.fieldErrors = {};

    if (!this.formData.salutation.trim()) {
      this.fieldErrors['salutation'] = 'Bitte Anrede eingeben';
    }

    if (!this.formData.firstName.trim()) {
      this.fieldErrors['firstName'] = 'Bitte Vorname eingeben';
    }

    if (!this.formData.lastName.trim()) {
      this.fieldErrors['lastName'] = 'Bitte Nachname eingeben';
    }

    if (!this.formData.email.trim()) {
      this.fieldErrors['email'] = 'Bitte E-Mail eingeben';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.fieldErrors['email'] = 'Ungültige E-Mail-Adresse';
    }

    // if (!this.formData.contactNumber.trim()) {
    //   this.fieldErrors['contactNumber'] = 'Bitte Telefonnummer eingeben';
    // }

    // if (!this.formData.customerId.trim()) {
    //   this.fieldErrors['customerId'] = 'Bitte Kundennummer eingeben';
    // }

    if (!this.selectedCategory) {
      this.fieldErrors['category'] = 'Bitte Betreff auswählen';
    }

    if (!this.formData.inquiry.trim()) {
      this.fieldErrors['inquiry'] = 'Bitte Nachricht eingeben';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }
  
  successMessage: string = '';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  submitForm() {
    if (!this.validate()) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = {
      salutation: this.formData.salutation,
      title: this.formData.title,
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      customerId: Number(this.authService.getUserId()),
      inquiry: this.formData.inquiry,
      categoryId: this.selectedCategory?.id,
      adminId: 1,
    };

    console.log('Contact Form Payload:', payload);

    this.http.post<any>('http://192.168.0.155:8080/save-customer-contact', payload).subscribe({
      next: (res) => {
        console.log('Contact form submitted successfully:', res);

        this.isSubmitting = false;

        if (res) {
          this.successMessage = 'Ihre Anfrage wurde erfolgreich gesendet.';

          this.formData = {
            salutation: '',
            title: '',
            firstName: '',
            lastName: '',
            email: '',
            inquiry: '',
            customerId: this.authService.getUserId()?.toString() ?? '',
          };

          this.selectedCategory = null;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Beim Senden der Anfrage ist ein Fehler aufgetreten.';

        console.error('Error submitting contact form:', err);
      },
    });
  }
}
