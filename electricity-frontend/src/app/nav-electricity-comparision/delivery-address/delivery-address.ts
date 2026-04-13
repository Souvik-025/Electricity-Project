import { Component, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { MatIcon } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { AboutUs } from '../../pages/about-us/about-us';
import { NeedSupport } from '../../layout/need-support/need-support';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

const API_BASE = 'http://192.168.0.155:8080';

@Component({
  selector: 'app-delivery-address',
  imports: [
    Sidebar,
    ContactPerson,
    NeedSupport,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    MatIcon,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './delivery-address.html',
  styleUrl: './delivery-address.css',
})
export class DeliveryAddress implements OnInit {
  // ── Delivery address fields ──────────────────────────────────────────────
  deliveryEmail: string = '';
  deliveryTitle: string = ''; // Dr. / Prof. / Prof. Dr.
  deliveryFirstName: string = '';
  deliveryLastName: string = '';
  deliveryPLZ: string = '12345'; // readonly — pre-filled
  deliveryOrt: string = 'Musterhausen'; // readonly — pre-filled
  deliveryStreet: string = 'Musterstraße'; // readonly — pre-filled
  deliveryHouseNumber: string = '10'; // readonly — pre-filled
  deliveryMobile: string = '';
  deliveryPhone: string = '';
  deliveryDate: Date | null = null;

  // ── Billing address toggle ───────────────────────────────────────────────
  hasDifferentBilling: boolean = false; // false = Nein selected (default)

  // ── Billing address fields (shown only when hasDifferentBilling = true) ──
  billingPLZ: string = '';
  billingOrt: string = '';
  billingStreet: string = '';
  billingHouseNumber: string = '';

  // ── UI state ─────────────────────────────────────────────────────────────
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  /** Per-field validation error messages shown inline under each input */
  validationErrors: Record<string, string> = {};

  // ── Main progress-bar step routes ────────────────────────────────────────
  private readonly mainStepRoutes: Record<number, string> = {
    1: '/electricity-comparision/register', // Account (adjust if different)
    2: '/electricity-comparision/delivery-address',
    3: '/electricity-comparision/connection-data', // replace with actual path
    4: '/electricity-comparision/payment-method', // replace with actual path
    5: '/electricity-comparision/checkout', // replace with actual path
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();
    console.log('ConnectionData init — userId:', userId, '| deliveryId:', deliveryId);
    console.log('Current deliveryId:', deliveryId);

    this.authService.getAuthState().subscribe((user) => {
      console.log('Current user:', this.authService.getCurrentUser());
      if (user?.email) {
        this.deliveryEmail = user.email;
      }
    });
  }

  // ── Main step navigation (progress bar) ─────────────────────────────────

  navigateToMainStep(step: number): void {
    const route = this.mainStepRoutes[step];
    if (route) {
      this.router.navigate([route]);
    }
  }

  // ── Title selection ──────────────────────────────────────────────────────

  selectTitle(title: string): void {
    this.deliveryTitle = this.deliveryTitle === title ? '' : title;
  }

  // ── Billing toggle ───────────────────────────────────────────────────────

  /** Toggle Ja / Nein for different billing address */
  setBillingToggle(value: boolean): void {
    this.hasDifferentBilling = value;
    // Clear billing fields and their errors when user switches to "Nein"
    if (!value) {
      this.billingPLZ = '';
      this.billingOrt = '';
      this.billingStreet = '';
      this.billingHouseNumber = '';
      delete this.validationErrors['billingPLZ'];
      delete this.validationErrors['billingOrt'];
      delete this.validationErrors['billingStreet'];
      delete this.validationErrors['billingHouseNumber'];
    }
  }

  /** Copy delivery address values into billing address fields */
  copyDeliveryToBilling(): void {
    this.billingPLZ = this.deliveryPLZ;
    this.billingOrt = this.deliveryOrt;
    this.billingStreet = this.deliveryStreet;
    this.billingHouseNumber = this.deliveryHouseNumber;
  }

  // ── Validation ───────────────────────────────────────────────────────────

  /**
   * Validates all required fields.
   * Populates `validationErrors` with messages for each invalid field.
   * Returns true when the form is valid.
   */
  private validate(): boolean {
    this.validationErrors = {};

    // E-Mail
    if (!this.deliveryEmail?.trim()) {
      this.validationErrors['deliveryEmail'] = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.deliveryEmail.trim())) {
      this.validationErrors['deliveryEmail'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    // Vorname
    if (!this.deliveryFirstName?.trim()) {
      this.validationErrors['deliveryFirstName'] = 'Bitte geben Sie Ihren Vornamen ein.';
    }

    // Nachname
    if (!this.deliveryLastName?.trim()) {
      this.validationErrors['deliveryLastName'] = 'Bitte geben Sie Ihren Nachnamen ein.';
    }

    // Handynummer (required; Telefonnummer is optional)
    if (!this.deliveryMobile?.trim()) {
      this.validationErrors['deliveryMobile'] = 'Bitte geben Sie Ihre Handynummer ein.';
    }

    // Liefertermin
    if (!this.deliveryDate) {
      this.validationErrors['deliveryDate'] = 'Bitte wählen Sie einen Liefertermin.';
    }

    // Billing address fields — only required when "Ja" is selected
    if (this.hasDifferentBilling) {
      if (!this.billingPLZ?.trim()) {
        this.validationErrors['billingPLZ'] = 'Bitte geben Sie Ihre PLZ ein.';
      }
      if (!this.billingOrt?.trim()) {
        this.validationErrors['billingOrt'] = 'Bitte geben Sie Ihren Ort ein.';
      }
      if (!this.billingStreet?.trim()) {
        this.validationErrors['billingStreet'] = 'Bitte geben Sie Ihre Straße ein.';
      }
      if (!this.billingHouseNumber?.trim()) {
        this.validationErrors['billingHouseNumber'] = 'Bitte geben Sie Ihre Hausnummer ein.';
      }
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  /** Validate, then build and POST the payload, then navigate to step 3 */
  openPage(): void {
    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();

    const payload = {
      customerId: userId,
      ...(deliveryId && { deliveryId }),
      deliveryAddress: {
        email: this.deliveryEmail,
        title: this.deliveryTitle,
        firstName: this.deliveryFirstName,
        lastName: this.deliveryLastName,
        mobile: this.deliveryMobile,
        telephone: this.deliveryPhone,
        deliveryDate: this.deliveryDate ? this.formatDate(this.deliveryDate) : null,
        zip: this.deliveryPLZ,
        city: this.deliveryOrt,
        street: this.deliveryStreet,
        houseNumber: this.deliveryHouseNumber,
      },
      billingAddress: {
        different: this.hasDifferentBilling,
        ...(this.hasDifferentBilling && {
          zip: this.billingPLZ,
          city: this.billingOrt,
          street: this.billingStreet,
          houseNumber: this.billingHouseNumber,
        }),
      },
    };

    this.http
      .post<{
        res: boolean;
        deliveryId: number;
      }>(`${API_BASE}/customer/add-delivery`, payload)
      .subscribe({
        next: (res) => {
          if (res?.deliveryId) {
            this.authService.setDeliveryId(res.deliveryId.toString());
          }

          this.isLoading = false;
          this.successMessage = 'Daten erfolgreich gespeichert.';
          this.router.navigate([this.mainStepRoutes[3]]);
        },
      });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
