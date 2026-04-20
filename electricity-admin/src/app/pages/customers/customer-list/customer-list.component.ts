import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

/**
 * Updated Type to align with API response and template needs
 */
type AdminCustomer = {
  id: number | string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null; // Changed from mobile to mobileNumber
  telephone?: string | null;
  userType: string | null;
  title: string | null;
  salutation: string | null;
  companyName: string | null;
  isVerified: boolean;
  isAcknowledged: boolean;
  joinedOn: number; // Unix timestamp from API
  uniqueCustomerId: string; // Added from API
  status: boolean;
  address: {
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
  expandedRow: number | string | null = null;

  hasMoreData = true;
  private readonly PAGE_LIMIT = 5;
  currentPage = 1;

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  /**
   * Toggles the accordion view for a specific customer
   */
  toggleRow(id: number | string): void {
    this.expandedRow = this.expandedRow === id ? null : id;
  }

  // Modified to accept a page number
  fetchCustomers(page: number = 1): void {
    this.currentPage = page;
    const payload = {
      adminId: this.authService.getUserId(),
      page: this.currentPage, // Sending page to backend
    };

    this.isLoading = true;
    this.errorMessage = "";
    this.expandedRow = null; // Close any open rows when switching pages

    this.api.post("admin/fetch-customer-details", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const newData = this.extractList(res);
        this.customers = newData;

        // Logic: If we received fewer items than the limit,
        // it's the last page.
        this.hasMoreData = newData.length === this.PAGE_LIMIT;

        this.expandedRow = null;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Kundenliste.";
      },
    });
  }

  nextPage() {
    if (this.hasMoreData) {
      this.fetchCustomers(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.fetchCustomers(this.currentPage - 1);
    }
  }

  /**
   * Helper to safely construct full name
   */
  fullName(customer: AdminCustomer): string {
    const first = (customer.firstName || "").trim();
    const last = (customer.lastName || "").trim();
    const value = [first, last].filter(Boolean).join(" ").trim();
    return value || "Keine Angabe";
  }

  /**
   * Private mapper to ensure the UI data structure is consistent
   */
  private extractList(response: any): AdminCustomer[] {
    const list = Array.isArray(response?.data) ? response.data : [];

    return list.map((item: any) => ({
      id: item.id,
      email: item.email ?? null,
      firstName: item.firstName ?? null,
      lastName: item.lastName ?? null,
      mobileNumber: item.mobileNumber ?? null,
      telephone: item.telephone ?? null,
      userType: item.userType ?? "PRIVATE",
      title: item.title ?? "",
      salutation: item.salutation ?? "",
      companyName: item.companyName ?? null,
      isVerified: !!item.isVerified,
      isAcknowledged: !!item.isAcknowledged,
      joinedOn: item.joinedOn ?? 0,
      uniqueCustomerId: item.uniqueCustomerId ?? "-",
      status: !!item.status,
      address: item.address ? { ...item.address } : null,
    }));
  }
}
