import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

const API_BASE = 'http://192.168.0.155:8080';

@Component({
  selector: 'app-payment-method',
  imports: [
    Sidebar,
    ContactPerson,
    NeedSupport,
    MatInputModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './payment-method.html',
  styleUrl: './payment-method.css',
})
export class PaymentMethod implements OnInit {
  // ── Payment method toggle ────────────────────────────────────────────────
  paymentMethod: string = 'ueberweisung'; // 'lastschrift' | 'ueberweisung'

  // ── SEPA / Lastschrift fields ────────────────────────────────────────────
  iban: string = '';
  firstName: string = '';
  lastName: string = '';
  sepaConsent: boolean = false;

  // ── UI state ─────────────────────────────────────────────────────────────
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  /** Per-field validation error messages shown inline under each input */
  validationErrors: Record<string, string> = {};

  // ── Main progress-bar step routes ────────────────────────────────────────
  private readonly mainStepRoutes: Record<number, string> = {
    1: '/electricity-comparision/register',
    2: '/electricity-comparision/delivery-address',
    3: '/electricity-comparision/connection-data',
    4: '/electricity-comparision/payment-method',
    5: '/electricity-comparision/checkout',
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
    console.log('PaymentMethod init — userId:', userId, '| deliveryId:', deliveryId);
  }

  // ── Toggle helpers ───────────────────────────────────────────────────────

  /** Toggle payment method (Lastschrift / Überweisung) */
  selectPaymentMethod(value: string): void {
    this.paymentMethod = value;
    // Reset SEPA fields and validation errors when switching away from Lastschrift
    if (value !== 'lastschrift') {
      this.iban = '';
      this.firstName = '';
      this.lastName = '';
      this.sepaConsent = false;
      delete this.validationErrors['iban'];
      delete this.validationErrors['firstName'];
      delete this.validationErrors['lastName'];
      delete this.validationErrors['sepaConsent'];
    }
  }

  // ── Validation ───────────────────────────────────────────────────────────

  /**
   * Validates all required fields based on the current form state.
   * Populates `validationErrors` with a message for every invalid field.
   * Returns true only when the form is fully valid.
   */
  private validate(): boolean {
    this.validationErrors = {};

    if (this.paymentMethod === 'lastschrift') {
      // IBAN — required and must be non-empty
      if (!this.iban?.trim()) {
        this.validationErrors['iban'] = 'Bitte geben Sie Ihre IBAN ein.';
      }

      // First name — required
      if (!this.firstName?.trim()) {
        this.validationErrors['firstName'] = 'Bitte geben Sie Ihren Vornamen ein.';
      }

      // Last name — required
      if (!this.lastName?.trim()) {
        this.validationErrors['lastName'] = 'Bitte geben Sie Ihren Nachnamen ein.';
      }

      // SEPA consent — must be accepted
      if (!this.sepaConsent) {
        this.validationErrors['sepaConsent'] = 'Bitte stimmen Sie dem SEPA-Lastschriftmandat zu.';
      }
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  /** Validate, then build and POST the payload, then navigate to step 5 */
  openPage(): void {
    if (!this.validate()) {
      return;
    }

    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();

    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    const payload = {
      customerId: userId,
      ...(deliveryId && { deliveryId }),
      paymentData: {
        paymentMethod: this.paymentMethod,
        ...(this.paymentMethod === 'lastschrift' && {
          iban: this.iban,
          accountHolder: {
            firstName: this.firstName,
            lastName: this.lastName,
          },
          sepaConsent: this.sepaConsent,
        }),
      },
    };

    console.log('Payload being sent to API:', JSON.stringify(payload, null, 2));

    this.http.post(`${API_BASE}/customer/add-payment`, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Zahlungsart erfolgreich gespeichert.';
        this.router.navigate([this.mainStepRoutes[5]]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        console.error('Payment method API error:', err);
      },
    });
  }
}
