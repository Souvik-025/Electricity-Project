import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

type AdminBooking = {
  id?: number | string | null;
  customerId?: number | string | null;
  deliveryId?: number | string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  dayOfWeek?: string | null;
  timeSlot?: string | null;
  description?: string | null;
  createdOn?: number | string | null;
};

@Component({
  selector: "app-booking-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./booking-list.component.html",
  styleUrl: "./booking-list.component.css",
})
export class BookingListComponent implements OnInit {
  bookings: AdminBooking[] = [];
  isLoading = false;
  errorMessage = "";

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    const payload = {
      adminId: this.authService.getUserId(),
    };

    this.isLoading = true;
    this.errorMessage = "";

    this.api.post("admin/get-all-bookings", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.bookings = this.extractList(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Buchungsliste.";
        console.error("Booking list fetch error:", err);
      },
    });
  }

  formatDate(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") {
      return "Keine Angabe";
    }

    const numericValue = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    const milliseconds = numericValue < 1000000000000 ? numericValue * 1000 : numericValue;
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(milliseconds));
  }

  private extractList(response: any): AdminBooking[] {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.bookings)) return response.bookings;
    if (Array.isArray(response)) return response;
    return [];
  }
}
