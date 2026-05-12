import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { ApiBooking } from "../booking-list/booking-list.component";

type DocInfo = {
  bookingDocId?: number | null;
  unsignedOriginalFileName?: string | null;
  fileUrl?: string | null;
  signedOriginalFileName?: string | null;
  signedFileUrl?: string | null;
  signedDocumentSubmitted?: boolean | null;
  addedOn?: number | null;
  deliveryId?: number | null;
};

type OrderInfo = {
  customerOrderId?: number | null;
  orderId?: number | null;
  orderStatus?: number | null;
  adminPlacedOrder?: boolean | null;
  adminOrderPlacedOn?: number | null;
  expiryOn?: number | null;
  lastDateOfCancellation?: number | null;
  operationPeriod?: number | null;
  isExpired?: boolean | null;
  isCancelled?: boolean | null;
  cancelledOn?: number | null;
  bookingDocId?: number | null;
  doc?: DocInfo | null;
};

type ApiBookingWithOrder = ApiBooking & { order?: OrderInfo | null };

/** Base URL for document files served from the backend */
const DOC_BASE_URL = "http://192.168.0.155:8080/assets/customers/";

/** How many times to poll for the doc after place-order before giving up */
const DOC_POLL_MAX_ATTEMPTS = 6;
/** Milliseconds between each poll attempt */
const DOC_POLL_INTERVAL_MS = 4000;

@Component({
  selector: "app-booking-detail",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./booking-details.component.html",
  styleUrl: "./booking-details.component.css",
})
export class BookingDetailComponent implements OnInit, OnDestroy {
  booking: ApiBookingWithOrder | null = null;
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

  // ── Doc polling state ─────────────────────────────────────────────────────
  /** True while we're waiting for the backend to generate the unsigned doc */
  isWaitingForDoc = false;
  docPollAttempt = 0;
  private docPollTimer: ReturnType<typeof setTimeout> | null = null;

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

  ngOnDestroy(): void {
    this.clearDocPollTimer();
  }

  fetchBooking(deliveryId: number): void {
    this.isLoading = true;
    this.errorMessage = "";
    const payload = { adminId: this.authService.getUserId(), deliveryId };
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

  /** No order object at all, or order exists but customerOrderId is null/undefined */
  get hasNoCustomerOrderId(): boolean {
    return !this.booking?.order?.customerOrderId;
  }

  /** customerOrderId exists but orderId is still null/undefined */
  get hasCustomerOrderIdOnly(): boolean {
    return (
      !!this.booking?.order?.customerOrderId && !this.booking?.order?.orderId
    );
  }

  /** Both customerOrderId and orderId exist */
  get hasOrderId(): boolean {
    return !!this.booking?.order?.orderId;
  }

  /** Unsigned PDF is available */
  get hasUnsignedDoc(): boolean {
    return !!this.booking?.order?.doc?.fileUrl;
  }

  /** Signed PDF has been uploaded */
  get hasSignedDoc(): boolean {
    return !!this.booking?.order?.doc?.signedFileUrl;
  }

  // ── Action: Create order ───────────────────────────────────────────────────

  createOrder(): void {
    if (!this.booking) return;
    this.isCreatingOrder = true;
    this.createOrderError = "";
    this.createOrderMessage = "";

    const payload = {
      adminId: this.authService.getUserId(),
      deliveryId: this.booking.deliveryId,
    };

    this.api.post("admin/create-order", payload).subscribe({
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

  // ── Action: Place (complete) order — async with doc polling ───────────────

  placeOrder(): void {
    if (!this.booking?.order?.customerOrderId) return;
    this.isPlacingOrder = true;
    this.orderError = "";
    this.orderPlacedMessage = "";
    this.orderPlacedNumber = null;

    const payload = {
      customerOrderId: this.booking.order.customerOrderId,
      adminId: this.authService.getUserId(),
    };

    this.api.post("admin/place-order", payload).subscribe({
      next: (res: any) => {
        this.isPlacingOrder = false;
        if (res?.res) {
          this.orderPlacedMessage =
            res.message ?? "Bestellung erfolgreich aufgegeben.";
          this.orderPlacedNumber = res["Order no"] ?? null;

          // First refresh: picks up orderId immediately
          this.fetchBookingAndThenPollForDoc(this.booking!.deliveryId ?? 0);
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

  /**
   * Fetches the booking, then checks whether the doc has arrived yet.
   * If not, schedules another attempt (up to DOC_POLL_MAX_ATTEMPTS).
   */
  private fetchBookingAndThenPollForDoc(deliveryId: number): void {
    this.isWaitingForDoc = true;
    this.docPollAttempt = 0;
    this.clearDocPollTimer();
    this.runDocPoll(deliveryId);
  }

  private runDocPoll(deliveryId: number): void {
    const payload = { adminId: this.authService.getUserId(), deliveryId };
    this.api.post("admin/fetch-deliveries", payload).subscribe({
      next: (res: any) => {
        const updated = this.extractBooking(res);
        if (updated) this.booking = updated;

        if (updated?.order?.doc?.fileUrl) {
          // Doc is ready — stop polling
          this.isWaitingForDoc = false;
          this.docPollAttempt = 0;
        } else {
          this.docPollAttempt++;
          if (this.docPollAttempt < DOC_POLL_MAX_ATTEMPTS) {
            this.docPollTimer = setTimeout(
              () => this.runDocPoll(deliveryId),
              DOC_POLL_INTERVAL_MS,
            );
          } else {
            // Give up polling — admin can refresh manually
            this.isWaitingForDoc = false;
          }
        }
      },
      error: () => {
        // On error just stop polling silently; data already shown
        this.isWaitingForDoc = false;
      },
    });
  }

  private clearDocPollTimer(): void {
    if (this.docPollTimer !== null) {
      clearTimeout(this.docPollTimer);
      this.docPollTimer = null;
    }
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
    formData.append("adminId", String(this.authService.getUserId()));

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

  // ── Helpers ──────────────────────────────────────────────────────────────

  fullName(): string {
    if (!this.booking) return "";
    return [this.booking.title, this.booking.firstName, this.booking.lastName]
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
      zip?: string;
      city?: string;
      street?: string;
      houseNumber?: string;
    } | null,
  ): string {
    if (!addr) return "—";
    return `${addr.street ?? ""} ${addr.houseNumber ?? ""}, ${addr.zip ?? ""} ${addr.city ?? ""}`.trim();
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

  private extractBooking(response: any): ApiBookingWithOrder | null {
    if (response?.data && !Array.isArray(response.data)) return response.data;
    if (response?.booking) return response.booking;
    const list: ApiBookingWithOrder[] = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.bookings)
        ? response.bookings
        : Array.isArray(response)
          ? response
          : [];
    return list[0] ?? null;
  }
}