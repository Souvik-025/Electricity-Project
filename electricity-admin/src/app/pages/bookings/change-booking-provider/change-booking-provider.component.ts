import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { ApiBooking } from "../booking-list/booking-list.component";

type CustomerAddress = {
  zip?: string | null;
  city?: string | null;
  street?: string | null;
  houseNumber?: string | null;
};

export type EgonRate = {
  rateId?: number | null;
  rateName?: string | null;
  providerId?: number | null;
  netzProviderId?: number | null; // added
  providerName?: string | null;
  providerSVG?: string | null;
  providerSVGPath?: string | null;
  consumption?: number | null;
  basePriceYear?: number | null;
  basePriceMonth?: number | null;
  workPrice?: number | null;
  workPriceNt?: number | null; // added
  totalPrice?: number | null;
  totalPriceMonth?: number | null;
  savingPerYear?: number | null; // added
  optBonus?: number | null; // added
  partialPayment?: number | null; // added
  optGuarantee?: string | null;
  optGuaranteeType?: string | null;
  optTerm?: string | null;
  rateChangeType?: string[] | null; // added
  cancel?: number | null;
  termBeforeNewType?: string | null; // added
  termBeforeNewMaxDate?: string | null; // added
  selfPayment?: boolean | null; // added
  requiredEmail?: boolean | null; // added
  optEco?: boolean | null;
  recommended?: boolean | null; // added
  branch?: string | null;
  type?: string | null; // added
};

export type BaseProviderRate = {
  rateId?: number;
  rateName?: string;
  basePriceYear?: number;
  basePriceMonth?: number;
  workPrice?: number;
  workPriceNt?: number;
};

export type BaseProvider = {
  providerId?: number;
  providerName?: string;
  rates?: BaseProviderRate[];
};

@Component({
  selector: "app-change-booking-provider",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./change-booking-provider.component.html",
  styleUrl: "./change-booking-provider.component.css",
})
export class ChangeBookingProviderComponent implements OnInit {
  booking: ApiBooking | null = null;

  // Search form (pre-filled from booking address)
  searchForm = {
    zip: "",
    city: "",
    street: "",
    houseNumber: "",
    consum: 4350,
    type: "private",
    branch: "electric",
  };

  rates: EgonRate[] = [];
  baseProvider: BaseProvider | null = null;
  selectedRate: EgonRate | null = null;

  isLoadingRates = false;
  rateError = "";
  isConfirming = false;
  successMessage = "";
  sortMode: "price_asc" | "price_desc" | "name_asc" = "price_asc";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Booking passed via router state from booking-list
    const state = history.state as { booking?: ApiBooking };
    if (state?.booking) {
      this.booking = state.booking;
      this.prefillForm(this.booking);
    }
  }

  private prefillForm(booking: ApiBooking): void {
    const addr = booking.customerAddress;
    if (addr) {
      this.searchForm.zip = addr.zip ?? "";
      this.searchForm.city = addr.city ?? "";
      this.searchForm.street = addr.street ?? "";
      this.searchForm.houseNumber = addr.houseNumber ?? "";
    }
    if (booking.provider?.branch) {
      this.searchForm.branch = booking.provider.branch;
    }
    // Auto-fetch on load if address is available
    if (this.searchForm.zip && this.searchForm.city) {
      this.fetchRates();
    }
  }

  fetchRates(): void {
    this.isLoadingRates = true;
    this.rateError = "";
    this.rates = [];
    this.selectedRate = null;
    this.successMessage = "";

    const payload = {
      ...this.searchForm,
      customerId: 0,
      adminId: this.authService.getUserId(),
    };

    this.api.post("api/get-rates", payload).subscribe({
      next: (res: any) => {
        this.isLoadingRates = false;
        this.rates = res?.rates?.result ?? [];
        this.baseProvider = res?.baseProvider?.result?.[0] ?? null;
        this.sortRates();
      },
      error: (err) => {
        this.isLoadingRates = false;
        this.rateError = "Fehler beim Laden der Tarife. Bitte Adresse prüfen.";
        console.error("Rate fetch error:", err);
      },
    });
  }

  sortRates(): void {
    const sorted = [...this.rates];
    if (this.sortMode === "price_asc") {
      sorted.sort((a, b) => (a.totalPrice ?? 0) - (b.totalPrice ?? 0));
    } else if (this.sortMode === "price_desc") {
      sorted.sort((a, b) => (b.totalPrice ?? 0) - (a.totalPrice ?? 0));
    } else if (this.sortMode === "name_asc") {
      sorted.sort((a, b) =>
        (a.providerName ?? "").localeCompare(b.providerName ?? ""),
      );
    }
    this.rates = sorted;
  }

  selectRate(rate: EgonRate): void {
    this.selectedRate = this.selectedRate?.rateId === rate.rateId ? null : rate;
  }

  isCheaper(rate: EgonRate): boolean {
    const currentPrice = this.booking?.provider?.totalPrice ?? Infinity;
    return (rate.totalPrice ?? Infinity) < currentPrice;
  }

  savings(rate: EgonRate): number {
    const current = this.booking?.provider?.totalPrice ?? 0;
    return current - (rate.totalPrice ?? 0);
  }

  overprice(rate: EgonRate): number {
    const current = this.booking?.provider?.totalPrice ?? 0;
    return (rate.totalPrice ?? 0) - current;
  }

  get cheaperCount(): number {
    return this.rates.filter((r) => this.isCheaper(r)).length;
  }

  confirmChange(): void {
    if (!this.selectedRate || !this.booking) return;
    this.isConfirming = true;

    const payload = {
      adminId: this.authService.getUserId(),
      deliveryId: this.booking.deliveryId,
      provider: {
        rateId: this.selectedRate.rateId,
        rateName: this.selectedRate.rateName,
        providerId: this.selectedRate.providerId,
        netzProviderId: this.selectedRate.netzProviderId,
        providerName: this.selectedRate.providerName,
        providerSVG: this.selectedRate.providerSVG,
        providerSVGPath: this.selectedRate.providerSVGPath,
        consumption: this.selectedRate.consumption,

        // Pricing Data
        basePriceYear: this.selectedRate.basePriceYear,
        basePriceMonth: this.selectedRate.basePriceMonth,
        workPrice: this.selectedRate.workPrice,
        totalPrice: this.selectedRate.totalPrice,
        totalPriceMonth: this.selectedRate.totalPriceMonth,
        savingPerYear: this.selectedRate.savingPerYear,
        workPriceNt: this.selectedRate.workPriceNt,
        optBonus: this.selectedRate.optBonus,

        // Contract Details
        partialPayment: this.selectedRate.partialPayment,
        optGuarantee: this.selectedRate.optGuarantee,
        optGuaranteeType: this.selectedRate.optGuaranteeType,
        optTerm: this.selectedRate.optTerm,
        rateChangeType: this.selectedRate.rateChangeType,
        cancel: this.selectedRate.cancel,
        termBeforeNewType: this.selectedRate.termBeforeNewType,
        termBeforeNewMaxDate: this.selectedRate.termBeforeNewMaxDate,

        // Status Flags
        selfPayment: this.selectedRate.selfPayment,
        requiredEmail: this.selectedRate.requiredEmail,
        optEco: this.selectedRate.optEco,
        recommended: this.selectedRate.recommended,

        // Meta Data
        branch: this.selectedRate.branch,
        type: this.selectedRate.type,
      },

      delivery: null,
      connection: null,
      paymentDetails: null,
    };

    this.api.post("admin/update-customer-booking", payload).subscribe({
      next: () => {
        this.isConfirming = false;
        this.successMessage = `Tarif erfolgreich auf „${this.selectedRate?.rateName}" (${this.selectedRate?.providerName}) geändert.`;
        this.selectedRate = null;
      },
      error: (err) => {
        this.isConfirming = false;
        this.rateError = "Fehler beim Übernehmen des Tarifs.";
        console.error("Provider change error:", err);
      },
    });
  }

  fullName(booking: ApiBooking): string {
    return [booking.title, booking.firstName, booking.lastName]
      .filter(Boolean)
      .join(" ");
  }

  formatAddress(addr?: CustomerAddress | null): string {
    if (!addr) return "—";
    return `${addr.street ?? ""} ${addr.houseNumber ?? ""}, ${addr.zip ?? ""} ${addr.city ?? ""}`.trim();
  }

  goBack(): void {
    this.router.navigate(["/bookings"]);
  }
}
