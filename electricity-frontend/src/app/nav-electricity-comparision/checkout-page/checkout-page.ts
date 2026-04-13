import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { AuthService } from '../../services/auth.service';

const API_BASE = 'http://192.168.0.155:8080';

interface CustomerAddress {
  id?: number;
  zip?: string | null;
  city?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  isDifferent?: boolean | null;
  createdOn?: number | null;
}

interface CustomerConnection {
  id?: number;
  isMovingIn?: boolean | null;
  moveInDate?: number | null;
  submitLater?: boolean | null;
  meterNumber?: string | null;
  currentProvider?: string | null;
  autoCancellation?: boolean | null;
  alreadyCancelled?: boolean | null;
  selfCancellation?: boolean | null;
  delivery?: boolean | string | number | null;
  desiredDelivery?: boolean | string | number | null;
  marketLocationId?: string | null;
  createdOn?: number | null;
}

interface CustomerPayment {
  id?: number;
  paymentMethod?: string | null;
  iban?: string | null;
  accountHolderFirstName?: string | null;
  accountHolderLastName?: string | null;
  sepaConsent?: boolean | null;
  createdOn?: number | null;
}

interface CustomerFormData {
  id?: number;
  title?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  telephone?: string | null;
  deliveryDate?: number | null;
  orderPlacedOn?: number | null;
  orderPlaced?: boolean | null;
  billingAddress?: CustomerAddress | null;
  address?: CustomerAddress | null;
  customerConnection?: CustomerConnection | null;
  customerPayment?: CustomerPayment | null;
  customerSchedule?: unknown;
}

interface FetchFormResponse {
  data?: CustomerFormData | null;
  message?: string;
  res?: boolean;
}

@Component({
  selector: 'app-checkout-page',
  imports: [ContactPerson, NeedSupport, RouterModule, CommonModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage implements OnInit {
  showConfirmation = false;
  isLoading = false;
  errorMessage = '';
  formData: CustomerFormData | null = null;

  private readonly mainStepRoutes: Record<number, string> = {
    1: '/electricity-comparision/register',
    2: '/electricity-comparision/delivery-address',
    3: '/electricity-comparision/connection-data',
    4: '/electricity-comparision/payment-method',
    5: '/electricity-comparision/checkout',
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchFormData();
  }

  openPage(): void {
    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();

    this.errorMessage = '';
    this.isLoading = true;

    const payload = {
      customerId: parseInt(userId ?? '0', 10),
      deliveryId: parseInt(deliveryId ?? '0', 10),
    };

    console.log('Payload being sent to API:', JSON.stringify(payload, null, 2));

    this.http.post(`${API_BASE}/customer/submit-declaration`, payload).subscribe({
      next: () => {
        this.isLoading = false;
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

  navigateToMainStep(step: number): void {
    const route = this.mainStepRoutes[step];
    if (route) {
      this.router.navigate([route]);
    }
  }

  get email(): string {
    return this.valueOrFallback(this.formData?.email || this.authService.getCurrentUser()?.email);
  }

  get deliveryAddress(): CustomerAddress | null | undefined {
    return this.formData?.address;
  }

  get billingAddress(): CustomerAddress | null | undefined {
    return this.formData?.billingAddress;
  }

  get billingDisplayAddress(): CustomerAddress | null | undefined {
    return this.billingAddress || this.deliveryAddress;
  }

  get connection(): CustomerConnection | null | undefined {
    return this.formData?.customerConnection;
  }

  get payment(): CustomerPayment | null | undefined {
    return this.formData?.customerPayment;
  }

  get fullName(): string {
    const parts = [this.formData?.title, this.formData?.firstName, this.formData?.lastName].filter(
      Boolean,
    );
    return this.valueOrFallback(parts.join(' '));
  }

  get billingAddressTitle(): string {
    return this.billingAddress?.isDifferent ? 'Abweichende Rechnungsadresse' : 'Rechnungsadresse';
  }

  get billingAddressHint(): string {
    return this.billingAddress?.isDifferent
      ? 'Ja, abweichende Rechnungsadresse'
      : 'Nein, identisch mit Lieferadresse';
  }

  get moveInLabel(): string {
    if (this.connection?.isMovingIn === null || this.connection?.isMovingIn === undefined) {
      return 'Keine Angabe';
    }

    return this.connection.isMovingIn ? 'Ja' : 'Nein';
  }

  get meterNumberLabel(): string {
    if (this.connection?.submitLater) {
      return 'Wird nachgereicht';
    }

    return this.valueOrFallback(this.connection?.meterNumber);
  }

  get marketLocationLabel(): string {
    return this.valueOrFallback(this.connection?.marketLocationId, 'Keine Angabe');
  }

  get currentProviderLabel(): string {
    return this.valueOrFallback(this.connection?.currentProvider, 'Wird nachgereicht');
  }

  get cancellationLabel(): string {
    if (this.connection?.autoCancellation) {
      return 'Automatische Kündigung durch neuen Anbieter';
    }

    if (this.connection?.alreadyCancelled) {
      return 'Vertrag wurde bereits gekündigt';
    }

    if (this.connection?.selfCancellation) {
      return 'Ich werde selbst kündigen';
    }

    if (this.connection?.isMovingIn) {
      return 'Keine Kündigung bei Neueinzug';
    }

    return 'Keine Angabe';
  }

  get desiredDeliveryLabel(): string {
    if (this.connection?.isMovingIn) {
      return this.formatTimestamp(this.connection?.moveInDate || this.formData?.deliveryDate);
    }

    if (this.connection?.desiredDelivery) {
      return this.formatFlexibleDate(this.connection.desiredDelivery);
    }

    if (this.connection?.delivery) {
      return this.formatFlexibleDate(this.connection.delivery);
    }

    return this.formData?.deliveryDate
      ? this.formatTimestamp(this.formData.deliveryDate)
      : 'Schnellstmöglich';
  }

  get paymentMethodLabel(): string {
    const method = this.payment?.paymentMethod;

    if (method === 'lastschrift') {
      return 'Lastschrift';
    }

    if (method === 'ueberweisung' || method === 'überweisung') {
      return 'Überweisung';
    }

    return this.valueOrFallback(method);
  }

  get accountHolderLabel(): string {
    const parts = [
      this.payment?.accountHolderFirstName,
      this.payment?.accountHolderLastName,
    ].filter(Boolean);
    return this.valueOrFallback(parts.join(' '));
  }

  formatTimestamp(value?: number | string | null): string {
    if (value === null || value === undefined || value === '') {
      return 'Keine Angabe';
    }

    const numericValue = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(numericValue)) {
      return this.valueOrFallback(String(value));
    }

    const milliseconds = numericValue < 1000000000000 ? numericValue * 1000 : numericValue;

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(milliseconds));
  }

  valueOrFallback(value?: string | number | boolean | null, fallback = 'Keine Angabe'): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    if (typeof value === 'boolean') {
      return value ? 'Ja' : 'Nein';
    }

    return String(value);
  }

  private fetchFormData(): void {
    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();

    // this.isLoading = true;
    // this.errorMessage = '';

    // const payload = {
    //   customerId: userId,
    //   deliveryId: deliveryId ?? 0, // or 0 depending on backend expectation
    //   step: 0,
    // };

    // this.http.post<FetchFormResponse>(`${API_BASE}/customer/fetch-form`, payload).subscribe({
    //   next: (res) => this.handleFetchSuccess(res),
    //   error: (err) => {
    //     if ([400, 404, 405].includes(err?.status)) {
    this.fetchFormDataWithPost(userId, deliveryId);
    //       return;
    //     }

    //     this.handleFetchError(err);
    //   },
    // });
  }

  private fetchFormDataWithPost(userId: string | null, deliveryId: string | null): void {
    const payload = {
      customerId: parseInt(userId ?? '0', 10),
      deliveryId: parseInt(deliveryId ?? '0', 10),
      step: 0,
    };

    console.log('Fetching form data with payload:', JSON.stringify(payload, null, 2));
    this.http.post<FetchFormResponse>(`${API_BASE}/customer/fetch-form`, payload).subscribe({
      next: (res) => this.handleFetchSuccess(res),
      error: (err) => this.handleFetchError(err),
    });
  }

  private handleFetchSuccess(res: FetchFormResponse): void {
    this.isLoading = false;

    console.log('Fetch form response:', JSON.stringify(res, null, 2));

    if (res?.res === false) {
      this.errorMessage = res?.message || 'Die gespeicherten Daten konnten nicht geladen werden.';
      return;
    }

    this.formData = res?.data ?? null;
  }

  private handleFetchError(err: any): void {
    this.isLoading = false;
    this.errorMessage =
      err?.error?.message || 'Die gespeicherten Daten konnten nicht geladen werden.';
  }

  private formatFlexibleDate(value: boolean | string | number): string {
    if (value === true) {
      return 'Schnellstmöglich';
    }

    if (value === false) {
      return 'Keine Angabe';
    }

    if (typeof value === 'string' && value.toLowerCase().includes('schnell')) {
      return 'Schnellstmöglich';
    }

    return this.formatTimestamp(value);
  }
}
