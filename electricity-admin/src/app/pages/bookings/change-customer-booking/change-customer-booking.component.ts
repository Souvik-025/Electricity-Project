import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { ApiBooking } from "../booking-list/booking-list.component";

// ─────────────────────────────────────────────────────────────────────────────
// Local form model — mirrors every field the admin can edit
// ─────────────────────────────────────────────────────────────────────────────
type EditableBooking = {
  // Step 2 — Lieferadresse (editable fields only; address is read-only)
  email: string;
  salutation: string;
  title: string;
  firstName: string;
  lastName: string;
  mobile: string;
  telephone: string;
  dob: string; // ISO date string for <input type="date">

  // Step 3 — Anschlussdaten  →  API `connection` object
  isMovingIn: boolean;
  moveInDate: string; // ISO date string; mapped to "DD.MM.YYYY" on submit
  submitLater: boolean;
  meterNumber: string;
  marketLocationId: string;
  currentProvider: string; // only relevant when isMovingIn === false
  autoCancellation: boolean;
  alreadyCancelled: boolean;
  selfCancellation: boolean;
  deliveryOption: "schnellstmoeglich" | "wunschtermin"; // drives `delivery` boolean
  desiredDeliveryDate: string; // ISO date; mapped to "DD.MM.YYYY" when deliveryOption === 'wunschtermin'

  // Step 4 — Zahlungsart  →  API `paymentDetails.paymentData`
  paymentMethod: string; // 'lastschrift' | 'ueberweisung'
  iban: string;
  paymentFirstName: string;
  paymentLastName: string;
  sepaConsent: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// API request / response shapes
// ─────────────────────────────────────────────────────────────────────────────

/** POST /admin/update-customer-booking — request body */
interface UpdateBookingPayload {
  deliveryId: number;
  adminId: string | number | null;
  delivery: {
    title: string;
    firstName: string;
    lastName: string;
    salutation: string;
    mobile: string;
    telephone: string;
    dob: string; // "DD.MM.YYYY"
    adminId: string | number | null;
  };
  connection: {
    isMovingIn: boolean;
    moveInDate: string; // "DD.MM.YYYY" or empty string
    submitLater: boolean;
    meterNumber: string;
    marketLocationId: string;
    currentProvider: string;
    autoCancellation: boolean;
    alreadyCancelled: boolean;
    selfCancellation: boolean;
    delivery: boolean; // true = Wunschtermin chosen
    desiredDelivery: string; // "DD.MM.YYYY" or empty string
  };
  paymentDetails: {
    paymentData: {
      paymentMethod: string;
      iban: string;
      sepaConsent: boolean;
      accountHolder: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

/** POST /admin/update-customer-booking — response body */
interface UpdateBookingResponse {
  res: boolean;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: "app-change-customer-booking",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./change-customer-booking.component.html",
  styleUrl: "./change-customer-booking.component.css",
})
export class BookingEditComponent implements OnInit {
  originalBooking: ApiBooking | null = null;
  form: EditableBooking = this.emptyForm();
  deliveryId: number | null = null;

  isLoading = false;
  isSaving = false;
  errorMessage = "";
  successMessage = "";
  validationErrors: Record<string, string> = {};

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Prefer booking passed via router state (from list page)
    const state = this.router.getCurrentNavigation?.()?.extras?.state as
      | { booking?: ApiBooking }
      | undefined;

    if (state?.booking) {
      this.originalBooking = state.booking;
      this.deliveryId = state.booking.deliveryId ?? null;
      this.populateForm(state.booking);
    } else {
      // Fallback: re-fetch by deliveryId from route param
      this.route.params.subscribe((params) => {
        this.deliveryId = Number(params["id"]) || null;
        if (this.deliveryId) this.fetchBooking(this.deliveryId);
      });
    }
  }

  // ─── Data loading ──────────────────────────────────────────────────────────

  private fetchBooking(id: number): void {
    this.isLoading = true;
    this.api
      .post("admin/fetch-deliveries", {
        adminId: this.authService.getUserId(),
        page: 1,
      })
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const list: ApiBooking[] = Array.isArray(res?.data) ? res.data : [];
          const found = list.find((b) => b.deliveryId === id);
          if (found) {
            this.originalBooking = found;
            this.populateForm(found);
          } else {
            this.errorMessage = "Buchung nicht gefunden.";
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = "Fehler beim Laden der Buchung.";
        },
      });
  }

  // ─── Form population ───────────────────────────────────────────────────────

  private populateForm(b: ApiBooking): void {
    const conn = b.connection;
    const pay = b.payment;

    this.form = {
      // Step 2
      email: b.email ?? "",
      salutation: (b as any).salutation ?? "",
      title: b.title ?? "",
      firstName: b.firstName ?? "",
      lastName: b.lastName ?? "",
      mobile: b.mobile ?? "",
      telephone: b.telephone ?? "",
      dob: this.tsOrStringToDateInput((b as any).dob ?? null),

      // Step 3
      isMovingIn: conn?.isMovingIn ?? false,
      moveInDate: this.tsOrStringToDateInput(conn?.moveInDate ?? null),
      submitLater: conn?.submitLater ?? false,
      meterNumber: conn?.meterNumber ?? "",
      marketLocationId: conn?.marketLocationId ?? "",
      currentProvider: conn?.currentProvider ?? "",
      autoCancellation: conn?.autoCancellation ?? false,
      alreadyCancelled: conn?.alreadyCancelled ?? false,
      selfCancellation: conn?.selfCancellation ?? false,
      deliveryOption: (conn as any)?.desiredDelivery
        ? "wunschtermin"
        : "schnellstmoeglich",
      desiredDeliveryDate: this.tsOrStringToDateInput(
        typeof (conn as any)?.desiredDelivery === "number" ||
          typeof (conn as any)?.desiredDelivery === "string"
          ? ((conn as any).desiredDelivery as number | string)
          : null,
      ),

      // Step 4
      paymentMethod: pay?.paymentMethod ?? "ueberweisung",
      iban: pay?.iban ?? "",
      paymentFirstName: pay?.firstName ?? "",
      paymentLastName: pay?.lastName ?? "",
      sepaConsent: pay?.sepaConsent ?? false,
    };
  }

  private emptyForm(): EditableBooking {
    return {
      email: "",
      salutation: "",
      title: "",
      firstName: "",
      lastName: "",
      mobile: "",
      telephone: "",
      dob: "",
      isMovingIn: false,
      moveInDate: "",
      submitLater: false,
      meterNumber: "",
      marketLocationId: "",
      currentProvider: "",
      autoCancellation: false,
      alreadyCancelled: false,
      selfCancellation: false,
      deliveryOption: "schnellstmoeglich",
      desiredDeliveryDate: "",
      paymentMethod: "ueberweisung",
      iban: "",
      paymentFirstName: "",
      paymentLastName: "",
      sepaConsent: false,
    };
  }

  // ─── Payment method toggle helper ──────────────────────────────────────────

  selectPaymentMethod(method: string): void {
    this.form.paymentMethod = method;
    // Clear Lastschrift-specific fields when switching away
    if (method !== "lastschrift") {
      this.form.iban = "";
      this.form.paymentFirstName = "";
      this.form.paymentLastName = "";
      this.form.sepaConsent = false;
      delete this.validationErrors["iban"];
      delete this.validationErrors["paymentFirstName"];
      delete this.validationErrors["paymentLastName"];
      delete this.validationErrors["sepaConsent"];
    }
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  private validate(): boolean {
    this.validationErrors = {};

    // Step 2
    if (!this.form.email?.trim())
      this.validationErrors["email"] = "E-Mail ist erforderlich.";
    if (!this.form.firstName?.trim())
      this.validationErrors["firstName"] = "Vorname ist erforderlich.";
    if (!this.form.lastName?.trim())
      this.validationErrors["lastName"] = "Nachname ist erforderlich.";
    if (!this.form.mobile?.trim())
      this.validationErrors["mobile"] = "Handynummer ist erforderlich.";

    // Step 3 — conditional
    if (this.originalBooking?.connection) {
      if (this.form.isMovingIn && !this.form.moveInDate)
        this.validationErrors["moveInDate"] = "Einzugsdatum ist erforderlich.";

      if (this.form.isMovingIn === false) {
        if (!this.form.currentProvider)
          this.validationErrors["currentProvider"] =
            "Bitte wählen Sie den Stromanbieter.";

        const anyCancellation =
          this.form.autoCancellation ||
          this.form.alreadyCancelled ||
          this.form.selfCancellation;
        if (!anyCancellation)
          this.validationErrors["cancellationOption"] =
            "Bitte wählen Sie eine Kündigungsoption aus.";

        if (
          this.form.deliveryOption === "wunschtermin" &&
          !this.form.desiredDeliveryDate
        )
          this.validationErrors["desiredDeliveryDate"] =
            "Bitte wählen Sie Ihren Wunschtermin.";
      }
    }

    // Step 4 — Lastschrift-specific
    if (
      this.originalBooking?.payment &&
      this.form.paymentMethod === "lastschrift"
    ) {
      if (!this.form.iban?.trim())
        this.validationErrors["iban"] = "IBAN ist erforderlich.";
      if (!this.form.paymentFirstName?.trim())
        this.validationErrors["paymentFirstName"] =
          "Vorname des Kontoinhabers ist erforderlich.";
      if (!this.form.paymentLastName?.trim())
        this.validationErrors["paymentLastName"] =
          "Nachname des Kontoinhabers ist erforderlich.";
      if (!this.form.sepaConsent)
        this.validationErrors["sepaConsent"] =
          "SEPA-Mandat muss erteilt werden.";
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (!this.originalBooking || !this.deliveryId || !this.validate()) return;

    this.isSaving = true;
    this.errorMessage = "";
    this.successMessage = "";

    const adminId = this.authService.getUserId();

    /**
     * Build the payload that exactly matches the documented API:
     *
     * POST /admin/update-customer-booking
     * {
     *   deliveryId, adminId,
     *   delivery:       { title, firstName, lastName, salutation, mobile, telephone, dob, adminId },
     *   connection:     { isMovingIn, moveInDate, submitLater, meterNumber, marketLocationId,
     *                     currentProvider, autoCancellation, alreadyCancelled, selfCancellation,
     *                     delivery, desiredDelivery },
     *   paymentDetails: { paymentData: { paymentMethod, iban, sepaConsent,
     *                                    accountHolder: { firstName, lastName } } }
     * }
     */
    const payload: UpdateBookingPayload = {
      deliveryId: this.deliveryId,
      adminId,

      // ── delivery object (Step 2 editable fields) ──────────────────────────
      delivery: {
        title: this.form.title,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        salutation: this.form.salutation,
        mobile: this.form.mobile,
        telephone: this.form.telephone,
        dob: this.toGermanDate(this.form.dob),
        adminId,
      },

      // ── connection object (Step 3) ─────────────────────────────────────────
      connection: {
        isMovingIn: this.form.isMovingIn,
        moveInDate: this.form.isMovingIn
          ? this.toGermanDate(this.form.moveInDate)
          : "",
        submitLater: this.form.submitLater,
        meterNumber: this.form.meterNumber,
        marketLocationId: this.form.marketLocationId,
        // These are only meaningful when NOT moving in; send empty/false when moving in
        currentProvider: this.form.isMovingIn ? "" : this.form.currentProvider,
        autoCancellation: this.form.isMovingIn
          ? false
          : this.form.autoCancellation,
        alreadyCancelled: this.form.isMovingIn
          ? false
          : this.form.alreadyCancelled,
        selfCancellation: this.form.isMovingIn
          ? false
          : this.form.selfCancellation,
        // `delivery` = true means the customer picked a specific desired date
        delivery:
          !this.form.isMovingIn && this.form.deliveryOption === "wunschtermin",
        desiredDelivery:
          !this.form.isMovingIn && this.form.deliveryOption === "wunschtermin"
            ? this.toGermanDate(this.form.desiredDeliveryDate)
            : "",
      } as UpdateBookingPayload["connection"],

      // ── paymentDetails object (Step 4) ────────────────────────────────────
      paymentDetails: {
        paymentData: {
          paymentMethod: this.form.paymentMethod,
          iban: this.form.paymentMethod === "lastschrift" ? this.form.iban : "",
          sepaConsent:
            this.form.paymentMethod === "lastschrift"
              ? this.form.sepaConsent
              : false,
          accountHolder: {
            firstName:
              this.form.paymentMethod === "lastschrift"
                ? this.form.paymentFirstName
                : "",
            lastName:
              this.form.paymentMethod === "lastschrift"
                ? this.form.paymentLastName
                : "",
          },
        },
      },
    };

    console.log(payload);

    this.api.post("admin/update-customer-booking", payload).subscribe({
      next: (res: any) => {
        const result = res as UpdateBookingResponse;
        this.isSaving = false;
        if (result?.res) {
          this.successMessage =
            result.message || "Buchung erfolgreich aktualisiert.";
          setTimeout(() => this.goBack(), 1500);
        } else {
          this.errorMessage = result?.message || "Speichern fehlgeschlagen.";
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.errorMessage =
          err?.error?.message ||
          "Fehler beim Speichern. Bitte erneut versuchen.";
      },
    });
  }

  openPicker(event: any) {
    try {
      // This calls the native browser date picker programmatically
      event.target.showPicker();
    } catch (error) {
      console.log("Browser does not support showPicker()");
    }
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(["/bookings"]);
  }

  // ─── Date helpers ──────────────────────────────────────────────────────────

  /**
   * Converts a unix timestamp (seconds or ms) OR a German date string ("DD.MM.YYYY")
   * into an ISO date string suitable for <input type="date"> ("YYYY-MM-DD").
   * Returns '' when the value is falsy or unparseable.
   */
  private tsOrStringToDateInput(
    value: number | string | null | undefined,
  ): string {
    if (!value && value !== 0) return "";

    // German date string "DD.MM.YYYY"
    if (typeof value === "string") {
      const germanMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
      if (germanMatch) {
        const [, day, month, year] = germanMatch;
        return `${year}-${month}-${day}`;
      }
    }

    // Unix timestamp (number or numeric string)
    const num = typeof value === "string" ? Number(value) : value;
    if (!num || isNaN(num)) return "";
    const ms = num < 1_000_000_000_000 ? num * 1000 : num;
    return new Date(ms).toISOString().split("T")[0];
  }

  /**
   * Converts an ISO date string ("YYYY-MM-DD") into the German format
   * "DD.MM.YYYY" expected by the API. Returns '' for empty input.
   */
  private toGermanDate(isoDate: string): string {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return "";
    return `${day}.${month}.${year}`;
  }
}
