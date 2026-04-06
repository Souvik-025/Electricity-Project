import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../shared/services/api.service";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "app-banners",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./banners.component.html",
  styleUrl: "./banners.component.css",
})
export class BannersComponent implements OnInit {
  // Upload State
  imageFile: File | null = null;
  imagePreview: string | null = null;

  // Showcase State (Existing Banner)
  currentBannerUrl: string | null = null;

  isLoading = false;
  errorMessage = "";

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.fetchCurrentBanner();
  }

  fetchCurrentBanner() {
    // Assuming type 5 is your banner type
    this.api.get("admin/get-menu/5").subscribe({
      next: (res: any) => {
        if (res && res.data && res.data.image) {
          this.currentBannerUrl = res.data.image;
        }
      },
      error: (err) => console.error("Could not load existing banner", err),
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.errorMessage = "Nur Bilddateien erlaubt";
      return;
    }

    this.errorMessage = "";
    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    const adminId = this.authService.getUserId();

    if (!this.imageFile) {
      this.errorMessage = "Bitte wählen Sie ein Bild aus";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    const payload = {
      adminId: adminId,
      type: 3, // Banner Type
    };

    const formData = new FormData();
    formData.append("file", this.imageFile);
    formData.append("data", JSON.stringify(payload));

    this.api.post("admin/add-menu", formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert("✅ Banner erfolgreich aktualisiert");
        // Update the showcase with the new preview and clear upload slot
        this.currentBannerUrl = this.imagePreview;
        this.imageFile = null;
        this.imagePreview = null;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Hochladen des Banners";
      },
    });
  }
}
