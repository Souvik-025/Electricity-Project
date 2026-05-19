import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

// ─────────────────────────────────────────────────────────────────────────────
// Full API response types (mirrors the /admin/fetch-deliveries response shape)
// Every field is optional / nullable because partially-completed bookings may
// omit any of them.
// ─────────────────────────────────────────────────────────────────────────────

type CustomerAddress = {
  zip?: string | null;
  city?: string | null;
  street?: string | null;
  houseNumber?: string | null;
};

type BillingAddress = CustomerAddress & {
  isDifferent?: boolean | null;
};

type ProviderInfo = {
  rateId?: number | null;
  rateName?: string | null;
  providerId?: number | null;
  netzProviderId?: number | null;
  providerName?: string | null;
  providerSVG?: string | null;
  providerSVGPath?: string | null;
  consumption?: number | null;
  basePriceYear?: number | null;
  basePriceMonth?: number | null;
  workPrice?: number | null;
  totalPrice?: number | null;
  totalPriceMonth?: number | null;
  savingPerYear?: number | null;
  workPriceNt?: number | null;
  optBonus?: number | null;
  partialPayment?: number | null;
  optGuarantee?: string | null;
  optGuaranteeType?: string | null;
  optTerm?: string | null;
  rateChangeType?: string | null;
  cancel?: number | null;
  cancelType?: number | null;
  termBeforeNewType?: string | null;
  termBeforeNewMaxDate?: string | null;
  selfPayment?: boolean | null;
  requiredEmail?: boolean | null;
  optEco?: boolean | null;
  recommended?: boolean | null;
  commission?: number | null;
  branch?: string | null;
  type?: string | null;
};

type ConnectionInfo = {
  id?: number | null;
  isMovingIn?: boolean | null;
  moveInDate?: number | null;
  submitLater?: boolean | null;
  meterNumber?: string | null;
  marketLocationId?: string | null;
  currentProvider?: string | null;
  autoCancellation?: boolean | null;
  alreadyCancelled?: boolean | null;
  selfCancellation?: boolean | null;
  delivery?: string | null;
  desiredDelivery?: string | null;
  customerNumber?: string | null;
};

type PaymentInfo = {
  id?: number | null;
  paymentMethod?: string | null;
  iban?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  sepaConsent?: boolean | null;
};

type ContactSchedule = {
  id?: number | null;
  dayOfWeek?: string | null;
  timeSlot?: string | null;
  description?: string | null;
};

type DocCustomer = {
  id?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
  title?: string | null;
  salutation?: string | null;
};

type CustomerInfo = {
  id?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
  title?: string | null;
  salutation?: string | null;
  companyName?: string | null;
  mobileNumber?: string | null;
  isVerified?: boolean | null;
  verifiedOn?: number | null;
  joinedOn?: number | null;
  isAcknowledged?: boolean | null;
  address?: CustomerAddress | null;
  status?: boolean | null;
  isNotificationEnabled?: boolean | null;
  lexofficeNumber?: string | null;
};

type DocInfo = {
  bookingDocId?: number | null;
  unsignedOriginalFileName?: string | null;
  fileUrl?: string | null;
  signedOriginalFileName?: string | null;
  signedFileUrl?: string | null;
  signedDocumentSubmitted?: boolean | null;
  addedOn?: number | null;
  deliveryId?: number | null;
  customer?: DocCustomer | null;
};

type OrderInfo = {
  customerOrderId?: number | null;
  orderId?: number | null;
  orderStatus?: number | null;
  adminPlacedOrder?: boolean | null;
  adminOrderPlacedOn?: number | null;
  expiryOn?: number | null;
  isExpired?: boolean | null;
  isCancelled?: boolean | null;
  cancelledOn?: number | null;
  lastDateOfCancellation?: number | null;
  operationPeriod?: number | null;
  doc?: DocInfo | null;
  bookingDocId?: number | null;
};

/** Full shape of a single delivery record returned by the API */
export type ApiBooking = {
  // ── Identity ────────────────────────────────────────────────────────────────
  deliveryId?: number | null;
  uniqueDeliveryId?: string | null;

  // ── Customer personal data ──────────────────────────────────────────────────
  email?: string | null;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  telephone?: string | null;
  dob?: number | null; // Unix timestamp (seconds)

  // ── Booking meta ────────────────────────────────────────────────────────────
  persons?: number | null;
  consumption?: number | null;
  orderPlacedOn?: number | null; // Unix timestamp (seconds)
  orderPlaced?: boolean | null;
  expiryOn?: number | null; // Unix timestamp (seconds)
  notificationEnabled?: boolean | null;

  // ── Addresses ───────────────────────────────────────────────────────────────
  customerAddress?: CustomerAddress | null;
  billingAddress?: BillingAddress | null;

  // ── Nested objects ───────────────────────────────────────────────────────────
  provider?: ProviderInfo | null;
  connection?: ConnectionInfo | null;
  payment?: PaymentInfo | null;
  contactSchedule?: ContactSchedule | null;
  customer?: CustomerInfo | null;
  order?: OrderInfo | null;

  // ── Legacy / derived fields that may appear in older records ─────────────────
  deliveryDate?: number | string | null;
};

/** Base URL for document files served from the backend */
const DOC_BASE_URL = "http://192.168.0.155:8080/assets/customers/";

@Component({
  selector: "app-booking-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./booking-details.component.html",
  styleUrl: "./booking-details.component.css",
})
export class BookingDetailComponent implements OnInit {
  booking: ApiBooking | null = null;
  isLoading = false;
  errorMessage = "";

  // ── Create order ──────────────────────────────────────────────────────────
  isCreatingOrder = false;
  createOrderMessage = "";
  createOrderError = "";

  // ── Place order ───────────────────────────────────────────────────────────
  isPlacingOrder = false;
  orderPlacedMessage = "";
  orderPlacedNumber: number | null = null;
  orderError = "";

  // ── Generate document (Order Created → upload doc button) ────────────────
  /** True while the admin/generate-booking-doc API call is in flight */
  isGeneratingDoc = false;
  generateDocMessage = "";
  generateDocError = "";

  // ── Upload document modal ─────────────────────────────────────────────────
  showUploadModal = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadMessage = "";
  uploadError = "";

  readonly dayLabels: Record<string, string> = {
    MONDAY: "Montag",
    TUESDAY: "Dienstag",
    WEDNESDAY: "Mittwoch",
    THURSDAY: "Donnerstag",
    FRIDAY: "Freitag",
    SATURDAY: "Samstag",
    SUNDAY: "Sonntag",
  };

  readonly timeLabels: Record<string, string> = {
    MORNING_08_11: "08–11 Uhr",
    AFTERNOON_11_14: "11–14 Uhr",
    AFTERNOON_14_17: "14–17 Uhr",
    EVENING_17_20: "17–20 Uhr",
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const deliveryId = this.route.snapshot.paramMap.get("id");
    if (deliveryId) {
      this.fetchBooking(Number(deliveryId));
    } else {
      this.errorMessage = "Keine Buchungs-ID angegeben.";
    }
  }

  fetchBooking(deliveryId: number): void {
    this.isLoading = true;
    this.errorMessage = "";
    const payload = { adminId: 1, deliveryId };
    this.api.post("admin/fetch-deliveries", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.booking = this.extractBooking(res);
        if (!this.booking) this.errorMessage = "Buchung nicht gefunden.";
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Buchung.";
        console.error("Booking detail fetch error:", err);
      },
    });
  }

  // ── Computed state helpers ─────────────────────────────────────────────────
  //
  // Button visibility is driven entirely by booking status. The 6 statuses and
  // their allowed actions are:
  //
  //  ┌─────────────────────┬──────────────────────────────────────────────────┐
  //  │ Status              │ Visible buttons                                  │
  //  ├─────────────────────┼──────────────────────────────────────────────────┤
  //  │ Incomplete          │ Change Provider · Change Booking · Continue Booking│
  //  │ Pending             │ Change Provider · Change Booking · Create Order  │
  //  │ Open Order          │ Data Verified & Complete Order                   │
  //  │ Order Created       │ Upload Documents                                 │
  //  │ Document Uploaded   │ (no action buttons)                              │
  //  │ Expired             │ Renew Booking                                    │
  //  └─────────────────────┴──────────────────────────────────────────────────┘
  //
  // Status resolution order (checked top-to-bottom, first match wins):
  //   1. Expired           → order.isExpired === true
  //   2. Document Uploaded → order.doc.signedFileUrl is present
  //   3. Order Created     → order.adminPlacedOrder === true
  //   4. Open Order        → order exists but orderId is null (customerOrderId only)
  //   5. Pending           → order object is null (customer submitted, no order yet)
  //   6. Incomplete        → fallback (booking exists, not yet submitted)
  // ──────────────────────────────────────────────────────────────────────────

  // ── Status: Expired ───────────────────────────────────────────────────────

  /**
   * TRUE when the booking/order has passed its expiry date.
   * Only "Renew Booking" is shown in this state.
   */
  get isExpired(): boolean {
    return this.booking?.order?.isExpired === true;
  }

  // ── Status: Document Uploaded ─────────────────────────────────────────────

  /**
   * TRUE when the customer's signed contract PDF has been successfully uploaded.
   * No action buttons are shown — the workflow is complete.
   */
  get hasSignedDoc(): boolean {
    return !!this.booking?.order?.doc?.signedFileUrl;
  }

  // ── Status: Order Created ─────────────────────────────────────────────────

  /**
   * TRUE when the admin has placed the order with the provider (adminPlacedOrder flag).
   * "Upload Documents" button is shown so the admin can trigger doc generation.
   * Also used to show the "Order placed" badge in the header.
   */
  get isOrderCreated(): boolean {
    return this.booking?.order?.adminPlacedOrder === true;
  }

  /**
   * TRUE once the backend has generated the contract PDF after the admin
   * clicked "Upload Documents". Used to show the PDF card in the details section.
   */
  get hasDoc(): boolean {
    return !!this.booking?.order?.doc?.fileUrl;
  }

  // ── Status: Open Order ────────────────────────────────────────────────────

  /**
   * TRUE when a customerOrderId exists but no orderId yet — meaning the order
   * has been created internally but not yet placed with the provider.
   * "Data Verified & Complete Order" button is shown.
   */
  get isOpenOrder(): boolean {
    return (
      !!this.booking?.order?.customerOrderId && !this.booking?.order?.orderId
    );
  }

  // ── Status: Pending ───────────────────────────────────────────────────────

  /**
   * TRUE when the booking's order object is null — the customer has completed
   * and submitted the booking form, but no internal order has been created yet.
   * Shown buttons: Change Provider · Change Booking · Create Order.
   */
  get isPending(): boolean {
    return (
      !this.isExpired && this.booking !== null && this.booking?.order === null
    );
  }

  // ── Status: Incomplete ────────────────────────────────────────────────────

  /**
   * TRUE when the booking exists but the customer has not fully submitted it yet
   * (orderPlaced is false/null and no order object is present).
   * Shown buttons: Change Provider · Change Booking · Continue Booking.
   */
  get isIncomplete(): boolean {
    if (!this.booking) return false;
    return (
      !this.isExpired &&
      !this.booking.orderPlaced &&
      !this.booking.order?.customerOrderId &&
      !this.booking.order?.isCancelled
    );
  }

  // ── Shared helpers ────────────────────────────────────────────────────────

  /**
   * "Change Provider" and "Change Booking" (Details bearbeiten) are available
   * on both Incomplete and Pending statuses — i.e. before any order is created.
   * Convenience getter used in the template to avoid duplicating the condition.
   */
  get canEditBeforeOrder(): boolean {
    return this.isIncomplete || this.isPending;
  }

  // ── Action: Create order ───────────────────────────────────────────────────

  createOrder(): void {
    if (!this.booking) return;
    this.isCreatingOrder = true;
    this.createOrderError = "";
    this.createOrderMessage = "";

    const payload = {
      adminId: 1,
      deliveryId: this.booking.deliveryId,
    };

    this.api.post("admin/open-order", payload).subscribe({
      next: (res: any) => {
        this.isCreatingOrder = false;
        if (res?.res) {
          this.createOrderMessage =
            res.message ?? "Auftrag erfolgreich erstellt.";
          this.fetchBooking(this.booking!.deliveryId ?? 0);
        } else {
          this.createOrderError =
            res?.message ?? "Unbekannter Fehler beim Erstellen des Auftrags.";
        }
      },
      error: (err) => {
        this.isCreatingOrder = false;
        this.createOrderError = "Fehler beim Erstellen des Auftrags.";
        console.error("Create order error:", err);
      },
    });
  }

  // ── Action: Place (complete) order ────────────────────────────────────────

  placeOrder(): void {
    if (!this.booking?.order?.customerOrderId) return;
    this.isPlacingOrder = true;
    this.orderError = "";
    this.orderPlacedMessage = "";
    this.orderPlacedNumber = null;

    const payload = {
      customerOrderId: this.booking.order.customerOrderId,
      adminId: 1,
    };

    this.api.post("admin/place-order", payload).subscribe({
      next: (res: any) => {
        this.isPlacingOrder = false;
        if (res?.res) {
          this.orderPlacedMessage =
            res.message ?? "Bestellung erfolgreich aufgegeben.";
          this.orderPlacedNumber = res["Order no"] ?? null;

          // Refresh booking so the status advances to "Order Created".
          // No document is generated at this point — the admin must click
          // "Upload Documents" separately to trigger doc generation.
          this.fetchBooking(this.booking!.deliveryId ?? 0);
        } else {
          this.orderError =
            res?.message ?? "Unbekannter Fehler beim Aufgeben der Bestellung.";
        }
      },
      error: (err) => {
        this.isPlacingOrder = false;
        this.orderError = "Fehler beim Aufgeben der Bestellung.";
        console.error("Place order error:", err);
      },
    });
  }

  // ── Action: Generate document ─────────────────────────────────────────────

  /**
   * Called when the admin clicks "Upload Documents" in the Order Created state.
   * Triggers doc generation on the backend (admin/generate-booking-doc).
   * Once successful the booking is refreshed and the PDF appears in the
   * documents section below for viewing / downloading.
   */
  generateDocument(): void {
    if (!this.booking?.order?.orderId) return;
    this.isGeneratingDoc = true;
    this.generateDocError = "";
    this.generateDocMessage = "";

    const payload = {
      customerOrderId: this.booking.order.customerOrderId,
      adminId: 1,
    };

    this.api.post("admin/fetch-signed-contract", payload).subscribe({
      next: (res: any) => {
        this.isGeneratingDoc = false;
        if (res?.res) {
          this.generateDocMessage =
            res.message ?? "Dokument erfolgreich hochgeladen.";
          // Refresh so the doc section populates with the new PDF links.
          this.fetchBooking(this.booking!.deliveryId ?? 0);
        } else {
          this.generateDocError =
            res?.errMessage ?? "Unbekannter Fehler beim Hochladen des Dokuments.";
        }
      },
      error: (err) => {
        this.isGeneratingDoc = false;
        this.generateDocError = "Fehler beim Hochladen des Dokuments.";
        console.error("Generate document error:", err);
      },
    });
  }

  // ── Document helpers ──────────────────────────────────────────────────────

  buildDocUrl(fileUrl?: string | null): string {
    if (!fileUrl) return "";
    // If already absolute, return as-is; otherwise prepend base
    return fileUrl.startsWith("http") ? fileUrl : `${DOC_BASE_URL}${fileUrl}`;
  }

  viewDocument(fileUrl?: string | null): void {
    const url = this.buildDocUrl(fileUrl);
    if (url) window.open(url, "_blank", "noopener");
  }

  downloadDocument(fileUrl?: string | null, fileName?: string | null): void {
    const url = this.buildDocUrl(fileUrl);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ?? "dokument.pdf";
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  }

  // ── Action: Upload signed document ────────────────────────────────────────

  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.uploadMessage = "";
    this.uploadError = "";
  }

  closeUploadModal(): void {
    if (this.isUploading) return;
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadMessage = "";
    this.uploadError = "";
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.uploadError = "";

    if (file && file.type !== "application/pdf") {
      this.uploadError = "Bitte nur PDF-Dateien hochladen.";
      this.selectedFile = null;
      input.value = "";
      return;
    }
    this.selectedFile = file;
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.booking?.order?.orderId) return;
    this.isUploading = true;
    this.uploadError = "";
    this.uploadMessage = "";

    const formData = new FormData();
    formData.append("file", this.selectedFile);
    formData.append("orderId", String(this.booking.order.orderId));
    formData.append("adminId", String(1));

    this.api.post("admin/upload-booking-doc", formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        if (res?.res) {
          this.uploadMessage =
            res.message ?? "Dokument erfolgreich hochgeladen.";
          this.fetchBooking(this.booking!.deliveryId ?? 0);
          setTimeout(() => this.closeUploadModal(), 1800);
        } else {
          this.uploadError =
            res?.message ?? "Unbekannter Fehler beim Hochladen.";
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadError = "Fehler beim Hochladen des Dokuments.";
        console.error("Upload document error:", err);
      },
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  editBooking(): void {
    if (!this.booking) return;
    this.router.navigate(["bookings/change", this.booking.deliveryId, "edit"], {
      state: { booking: this.booking },
    });
  }

  completeBooking(): void {
    if (!this.booking) return;
    this.router.navigate(["/booking/new"], {
      queryParams: { deliveryId: this.booking.deliveryId },
    });
  }

  changeProvider(): void {
    if (!this.booking) return;
    this.router.navigate(
      ["bookings", this.booking.deliveryId, "change-provider"],
      { state: { booking: this.booking } },
    );
  }

  goBack(): void {
    this.router.navigate(["/bookings"]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  fullName(): string {
    if (!this.booking) return "";
    return [this.booking.title, this.booking.firstName, this.booking.lastName]
      .filter(Boolean)
      .join(" ");
  }

  customerAccountName(): string {
    const customer = this.booking?.customer;
    if (!customer) return "";
    return [
      customer.salutation,
      customer.title,
      customer.firstName,
      customer.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  initials(): string {
    if (!this.booking) return "?";
    const f = this.booking.firstName?.[0] ?? "";
    const l = this.booking.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "?";
  }

  formatAddress(
    addr?: {
      zip?: string | null;
      city?: string | null;
      street?: string | null;
      houseNumber?: string | null;
    } | null,
  ): string {
    if (!addr) return "—";
    const street = [addr.street, addr.houseNumber].filter(Boolean).join(" ");
    const city = [addr.zip, addr.city].filter(Boolean).join(" ");
    return [street, city].filter(Boolean).join(", ") || "—";
  }

  dayLabel(key?: string | null): string {
    return key ? (this.dayLabels[key] ?? key) : "—";
  }

  timeLabel(key?: string | null): string {
    return key ? (this.timeLabels[key] ?? key) : "—";
  }

  formatIban(iban?: string | null): string {
    if (!iban) return "—";
    return iban.replace(/(.{4})/g, "$1 ").trim();
  }

  formatDate(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    const ms = num < 1_000_000_000_000 ? num * 1000 : num;
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(ms));
  }

  formatDateTime(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    const ms = num < 1_000_000_000_000 ? num * 1000 : num;
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ms));
  }

  formatValue(value?: string | number | boolean | null): string {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return this.formatBoolean(value);
    return String(value);
  }

  formatBoolean(value?: boolean | null): string {
    if (value === null || value === undefined) return "—";
    return value ? "Ja" : "Nein";
  }

  formatMoney(value?: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(2)} €`;
  }

  formatNumber(value?: number | null, suffix = ""): string {
    if (value === null || value === undefined) return "—";
    return `${value}${suffix}`;
  }

  formatWorkPrice(value?: number | null): string {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(4)} ct/kWh`;
  }

  private extractBooking(response: any): ApiBooking | null {
    if (response?.data && !Array.isArray(response.data)) return response.data;
    if (response?.booking) return response.booking;
    const list: ApiBooking[] = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.bookings)
        ? response.bookings
        : Array.isArray(response)
          ? response
          : [];
    return list[0] ?? null;
  }

  /**
   * Derives the display status string for this booking.
   * Resolution order must match the priority table in the computed getters above.
   */
  getBookingStatus(): string {
    if (!this.booking) return "Unknown";

    // 1. Expired — checked first; an expired booking overrides all other states.
    if (this.isExpired) return "Expired";

    // 2. Document Uploaded — signed PDF has been submitted; workflow is done.
    if (this.hasSignedDoc) return "Document Uploaded";

    // 3. Order Created — admin has placed the order with the provider.
    if (this.isOrderCreated) return "Order Created";

    // 4. Open Order — internal order created, but not yet placed with provider.
    if (this.isOpenOrder) return "Open Order";

    // 5. Pending — booking submitted by customer, but no internal order yet.
    if (this.isPending) return "Pending";

    // 6. Incomplete — booking exists but customer hasn't finished submitting it.
    if (this.isIncomplete) return "Incomplete";

    return "Unknown";
  }

  getBookingStatusClass(): string {
    const status = this.getBookingStatus();

    switch (status) {
      case "Expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      case "Document Uploaded":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "Order Created":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";

      case "Open Order":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

      case "Pending":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";

      case "Incomplete":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }
}
