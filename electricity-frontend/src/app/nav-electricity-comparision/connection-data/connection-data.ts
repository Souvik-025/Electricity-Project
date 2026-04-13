import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

const API_BASE = 'http://192.168.0.155:8080';

@Component({
  selector: 'app-connection-data',
  imports: [
    MatInputModule,
    MatNativeDateModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    RouterModule,
    MatDatepickerModule,
    Sidebar,
    ContactPerson,
    NeedSupport,
  ],
  templateUrl: './connection-data.html',
  styleUrl: './connection-data.css',
})
export class ConnectionData implements OnInit {
  // ── Move-in toggle ───────────────────────────────────────────────────────
  selection: string = 'no';

  // ── Connection data fields ───────────────────────────────────────────────
  moveInDate: Date | null = null;
  submitLaterChecked: boolean = false;
  meterNumber: string = '';
  marketLocationId: string = '';

  // ── Cancellation options (only when selection === 'no') ──────────────────
  currentProvider: string = '';
  autoCancellation: boolean = true;
  alreadyCancelled: boolean = false;
  selfCancellation: boolean = false;

  // ── Delivery date options (only when selection === 'no') ─────────────────
  deliveryOption: string = 'schnellstmoeglich'; // 'schnellstmoeglich' | 'wunschtermin'
  desiredDeliveryDate: Date | null = null;

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
  }

  // ── Toggle helpers ───────────────────────────────────────────────────────

  selectOption(value: string): void {
    this.selection = value;
    if (value !== 'yes') {
      this.moveInDate = null;
      delete this.validationErrors['moveInDate'];
    }
    if (value !== 'no') {
      delete this.validationErrors['currentProvider'];
      delete this.validationErrors['desiredDeliveryDate'];
    }
  }

  selectDeliveryOption(value: string): void {
    this.deliveryOption = value;
    if (value !== 'wunschtermin') {
      this.desiredDeliveryDate = null;
      delete this.validationErrors['desiredDeliveryDate'];
    }
  }

  selectCancellation(type: 'alreadyCancelled' | 'selfCancellation'): void {
    this.alreadyCancelled = type === 'alreadyCancelled';
    this.selfCancellation = type === 'selfCancellation';
  }

  // ── Validation ───────────────────────────────────────────────────────────

  /**
   * Validates all required fields based on the current form state.
   * Populates `validationErrors` with a message for every invalid field.
   * Returns true only when the form is fully valid.
   */
  private validate(): boolean {
    this.validationErrors = {};

    // Move-in date — required only when user is moving in
    if (this.selection === 'yes') {
      if (!this.moveInDate) {
        this.validationErrors['moveInDate'] = 'Bitte wählen Sie ein Einzugsdatum.';
      }
    }

    // Meter number — required unless the user checked "Ich reiche … nach"
    if (!this.submitLaterChecked && !this.meterNumber?.trim()) {
      this.validationErrors['meterNumber'] = 'Bitte geben Sie Ihre Zählernummer ein.';
    }

    if (this.selection === 'no') {
      // Current provider
      if (!this.currentProvider) {
        this.validationErrors['currentProvider'] =
          'Bitte wählen Sie Ihren derzeitigen Stromanbieter.';
      }

      // Desired delivery date — required only when "Wunschtermin" is chosen
      if (this.deliveryOption === 'wunschtermin' && !this.desiredDeliveryDate) {
        this.validationErrors['desiredDeliveryDate'] = 'Bitte wählen Sie Ihren Wunschtermin.';
      }
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  /** Validate, then build and POST the payload, then navigate to step 4 */
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
      connectionData: {
        isMovingIn: this.selection === 'yes',
        ...(this.selection === 'yes' && {
          moveInDate: this.moveInDate ? this.formatDate(this.moveInDate) : null,
        }),
        submitLater: this.submitLaterChecked,
        meterNumber: this.meterNumber,
        marketLocationId: this.marketLocationId,
        ...(this.selection === 'no' && {
          currentProvider: this.currentProvider,
          cancellation: {
            autoCancellation: this.autoCancellation,
            alreadyCancelled: this.alreadyCancelled,
            selfCancellation: this.selfCancellation,
          },
          deliveryDate: {
            hasDesiredDate: this.deliveryOption === 'wunschtermin',
            desiredDate:
              this.deliveryOption === 'wunschtermin' && this.desiredDeliveryDate
                ? this.formatDate(this.desiredDeliveryDate)
                : null,
          },
        }),
      },
    };

    console.log('Payload being sent to API:', JSON.stringify(payload, null, 2));

    this.http.post(`${API_BASE}/customer/add-connection`, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Daten erfolgreich gespeichert.';
        this.router.navigate([this.mainStepRoutes[4]]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
        console.error('Connection data API error:', err);
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
