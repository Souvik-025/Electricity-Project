import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

type AdminCustomer = {
  id?: number | string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  telephone?: string | null;

  userType?: string | null;
  title?: string | null;
  salutation?: string | null;
  companyName?: string | null;
  isVerified?: boolean;
  isAcknowledged?: boolean;
  status?: boolean;

  address?: {
    zip?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  } | null;
};
@Component({
  selector: "app-customer-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./customer-list.component.html",
  styleUrl: "./customer-list.component.css",
})
export class CustomerListComponent implements OnInit {
  customers: AdminCustomer[] = [];
  isLoading = false;
  errorMessage = "";
  expandedRow: number | null = null;

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  toggleRow(id: number | string | null) {
    this.expandedRow = this.expandedRow === id ? null : id;
  }

  fetchCustomers(): void {
    const payload = {
      adminId: this.authService.getUserId(),
    };

    this.isLoading = true;
    this.errorMessage = "";

    this.api.post("admin/fetch-customer-details", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.customers = this.extractList(res);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Kundenliste.";
        console.error("Customer list fetch error:", err);
      },
    });
  }

  fullName(customer: AdminCustomer): string {
    const first = (customer.firstName || "").trim();
    const last = (customer.lastName || "").trim();
    const value = [first, last].filter(Boolean).join(" ").trim();
    return value || "Keine Angabe";
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
    }).format(new Date(milliseconds));
  }

  private extractList(response: any): AdminCustomer[] {
    const list =
      Array.isArray(response?.data)
        ? response.data
        : [];

    return list.map((item: any) => ({
      id: item.id,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,

      mobile: item.mobileNumber,
      telephone: item.telephone ?? null,

      userType: item.userType,
      title: item.title,
      salutation: item.salutation,
      companyName: item.companyName,

      isVerified: item.isVerified,
      isAcknowledged: item.isAcknowledged,
      status: item.status,

      address: item.address ?? null,
    }));
  }
}
