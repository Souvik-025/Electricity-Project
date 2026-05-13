import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { environment } from "../../../../environments/environment";

type SignatureResponse = {
  res?: boolean;
  data?: {
    signature?: string | null;
    signatureUrl?: string | null;
    adminSignature?: string | null;
    adminSignatureUrl?: string | null;
  } | string | null;
  signature?: string | null;
  signatureUrl?: string | null;
  adminSignature?: string | null;
  adminSignatureUrl?: string | null;
  message?: string;
};

type CanvasPoint = {
  x: number;
  y: number;
};

type SignatureStroke = {
  points: CanvasPoint[];
};

const FETCH_SIGNATURE_ENDPOINT = "admin/fetch-admin-signature";
const SAVE_SIGNATURE_ENDPOINT = "admin/add-signature";

@Component({
  selector: "app-admin-signature",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-signature.component.html",
  styleUrl: "./admin-signature.component.css",
})
export class AdminSignatureComponent implements OnInit, AfterViewInit {
  @ViewChild("signatureCanvas") signatureCanvas?: ElementRef<HTMLCanvasElement>;

  signaturePreview = "";
  isLoading = false;
  isSaving = false;
  isEditing = false;
  hasDrawn = false;
  successMessage = "";
  errorMessage = "";

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private strokes: SignatureStroke[] = [];
  private currentStroke: SignatureStroke | null = null;
  private readonly canvasHeight = 260;
  private readonly minCanvasWidth = 320;

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchSignature();
  }

  ngAfterViewInit(): void {
    if (this.isEditing) this.prepareCanvas();
  }

  get canUndo(): boolean {
    return this.strokes.length > 0 && !this.isSaving;
  }

  @HostListener("window:resize")
  onResize(): void {
    if (this.isEditing) this.prepareCanvas();
  }

  fetchSignature(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.api
      .post(FETCH_SIGNATURE_ENDPOINT, { adminId: this.authService.getUserId() })
      .subscribe({
        next: (res: SignatureResponse) => {
          this.isLoading = false;
          this.signaturePreview = this.normalizeSignatureSource(
            this.extractSignature(res),
          );
          this.isEditing = !this.signaturePreview;
          this.resetDraft();
          setTimeout(() => this.prepareCanvas());
        },
        error: (err) => {
          this.isLoading = false;
          this.isEditing = true;
          this.errorMessage =
            this.api.extractErrorMessage(err) || "Signatur konnte nicht geladen werden.";
          setTimeout(() => this.prepareCanvas());
        },
      });
  }

  startEdit(): void {
    this.isEditing = true;
    this.successMessage = "";
    this.errorMessage = "";
    this.resetDraft();
    setTimeout(() => this.prepareCanvas());
  }

  cancelEdit(): void {
    this.isEditing = !this.signaturePreview;
    this.errorMessage = "";
    this.successMessage = "";
    this.resetDraft();
    setTimeout(() => this.prepareCanvas());
  }

  clearSignature(): void {
    this.resetDraft();
    this.renderCanvas();
  }

  undoLastStroke(): void {
    if (!this.canUndo) return;
    this.strokes.pop();
    this.currentStroke = null;
    this.isDrawing = false;
    this.hasDrawn = this.strokes.length > 0;
    this.renderCanvas();
  }

  beginDraw(event: PointerEvent): void {
    if (!this.ctx || !this.signatureCanvas) return;
    event.preventDefault();
    this.signatureCanvas.nativeElement.setPointerCapture(event.pointerId);
    this.isDrawing = true;
    const point = this.getCanvasPoint(event);
    this.currentStroke = { points: [point] };
    this.strokes.push(this.currentStroke);
    this.hasDrawn = true;
    this.renderCanvas();
  }

  draw(event: PointerEvent): void {
    if (!this.isDrawing || !this.currentStroke) return;
    event.preventDefault();

    const point = this.getCanvasPoint(event);
    this.currentStroke.points.push(point);
    this.renderCanvas();
  }

  endDraw(event?: PointerEvent): void {
    if (event && this.signatureCanvas?.nativeElement.hasPointerCapture(event.pointerId)) {
      this.signatureCanvas.nativeElement.releasePointerCapture(event.pointerId);
    }
    this.isDrawing = false;
    this.currentStroke = null;
  }

  async saveSignature(): Promise<void> {
    if (!this.signatureCanvas || !this.hasDrawn) {
      this.errorMessage = "Bitte zeichnen Sie zuerst eine Signatur.";
      return;
    }

    this.isSaving = true;
    this.successMessage = "";
    this.errorMessage = "";

    const signatureCanvas = this.createSignatureCanvas();
    const adminSignaturePreview = signatureCanvas.toDataURL("image/png");
    let signatureBlob: Blob;

    try {
      signatureBlob = await this.canvasToBlob(signatureCanvas);
    } catch {
      this.isSaving = false;
      this.errorMessage = "Signaturbild konnte nicht erstellt werden.";
      return;
    }

    const payload = new FormData();
    payload.append("data", JSON.stringify({"adminId": 1}));

    // payload.append("data", String(this.authService.getUserId() ?? ""));
    payload.append(
      "file",
      new File([signatureBlob], "admin-signature.png", {
        type: "image/png",
      }),
    );


    console.log(payload);

    this.api.post(SAVE_SIGNATURE_ENDPOINT, payload).subscribe({
      next: (res: SignatureResponse) => {
        this.isSaving = false;
        if (res?.res === false) {
          this.errorMessage = res.message || "Signatur konnte nicht gespeichert werden.";
          return;
        }

        this.signaturePreview =
          this.normalizeSignatureSource(this.extractSignature(res)) ||
          adminSignaturePreview;
        this.successMessage = res?.message || "Signatur wurde erfolgreich gespeichert.";
        this.isEditing = false;
        this.resetDraft();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage =
          this.api.extractErrorMessage(err) || "Signatur konnte nicht gespeichert werden.";
      },
    });
  }

  private prepareCanvas(): void {
    if (!this.signatureCanvas || !this.isEditing) return;

    const canvas = this.signatureCanvas.nativeElement;
    const parentWidth = canvas.parentElement?.clientWidth || 720;
    const cssWidth = Math.max(this.minCanvasWidth, parentWidth);
    const cssHeight = this.canvasHeight;
    const scale = window.devicePixelRatio || 1;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.floor(cssWidth * scale);
    canvas.height = Math.floor(cssHeight * scale);

    this.ctx = canvas.getContext("2d");
    if (!this.ctx) return;

    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#111827";
    this.renderCanvas();
  }

  private renderCanvas(): void {
    if (!this.ctx || !this.signatureCanvas) return;
    const canvas = this.signatureCanvas.nativeElement;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.strokeStyle = "#e5e7eb";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(24, height - 52);
    this.ctx.lineTo(width - 24, height - 52);
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.strokeStyle = "#111827";
    this.ctx.lineWidth = 2.5;
    this.strokes.forEach((stroke) => this.drawStroke(this.ctx!, stroke.points));
  }

  private drawStroke(ctx: CanvasRenderingContext2D, points: CanvasPoint[]): void {
    if (points.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.6;

    if (points.length === 1) {
      const point = points[0];
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = "#111827";
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midPoint = {
        x: (current.x + next.x) / 2,
        y: (current.y + next.y) / 2,
      };
      ctx.quadraticCurveTo(current.x, current.y, midPoint.x, midPoint.y);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
    ctx.restore();
  }

  private createSignatureCanvas(): HTMLCanvasElement {
    const canvas = this.signatureCanvas!.nativeElement;
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const exportCanvas = document.createElement("canvas");
    const exportScale = 2;

    exportCanvas.width = Math.floor(width * exportScale);
    exportCanvas.height = Math.floor(height * exportScale);

    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return canvas;

    exportCtx.scale(exportScale, exportScale);
    this.strokes.forEach((stroke) => this.drawStroke(exportCtx, stroke.points));
    return exportCanvas;
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Unable to create signature image."));
        }
      }, "image/png");
    });
  }

  private resetDraft(): void {
    this.strokes = [];
    this.currentStroke = null;
    this.isDrawing = false;
    this.hasDrawn = false;
  }

  private getCanvasPoint(event: PointerEvent): CanvasPoint {
    const canvas = this.signatureCanvas!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private extractSignature(res: SignatureResponse): string {
    const data = res?.data;
    if (typeof data === "string") return data;

    return (
      data?.signatureUrl ||
      data?.adminSignatureUrl ||
      data?.signature ||
      data?.adminSignature ||
      res?.signatureUrl ||
      res?.adminSignatureUrl ||
      res?.signature ||
      res?.adminSignature ||
      ""
    );
  }

  private normalizeSignatureSource(source: string): string {
    if (!source) return "";
    if (
      source.startsWith("data:") ||
      source.startsWith("http://") ||
      source.startsWith("https://") ||
      source.startsWith("blob:")
    ) {
      return source;
    }
    return `${environment.imageBaseUrl}${source}`;
  }
}
