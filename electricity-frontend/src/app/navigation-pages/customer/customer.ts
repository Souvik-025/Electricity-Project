import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from 'express';
import { CommonModule } from '@angular/common';
import SignaturePad from 'signature_pad';
import { CountdownComponent, CountdownConfig, CountdownEvent } from 'ngx-countdown';
import { environment } from '../../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-customer',
  imports: [CommonModule, CountdownComponent, MatFormFieldModule, MatInputModule],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})
export class Customer {
  constructor(
    // private http: HttpClient,
    // private cdr: ChangeDetectorRef,
    private authService: AuthService,
    // private router: Router,
  ) {}

  tabs: string[] = [
    'Persönliche Daten / Verträge',
    'Mein Haushalt',
    'Zählerstand melden',
    'Wechselinnerung',
    'Serviceanfragen',
    'Beratervollmacht',
    'Dokumentenarchiv',
    'Passwort zurücksetzen',
  ];

  /* ── Tab control ──────────────────────────────────────────────── */
  activeTab: number = 4;
  serviceTab: number = 1;
  /* ── Step control ──────────────────────────────────────────────── */
  currentStep: number = 1;
  /* ── Customer Type (Personal/Business) ──────────────────────────────────────────────── */
  customerType: number = 1;

  setActiveTab(index: number) {
    this.activeTab = index;
    this.currentStep = 1;
    this.serviceTab = 1;
  }

  nextStep(step: number) {
    this.currentStep = step;
    if (step === 2 && this.activeTab === 5) {
      setTimeout(() => {
        this.initSignature();
      });
    }

    if (step === 2 && this.activeTab === 7) {
      setTimeout(() => {
        if (this.countdown) {
          this.countdown.restart();
        }
      }, 0);
    }
  }

  showLogoutModal: boolean = false;

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;

    console.log('Logged out');

    this.authService.logout();
  }
  /* ════════════════════════════════════════════════════════════════════════════════════════════════*/

  /*── Power of Attorney Section Start ──*/
  /* ── Signature ─── */

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;

  initSignature() {
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')!.scale(ratio, ratio);

    this.signaturePad = new SignaturePad(canvas);
  }

  clear() {
    this.signaturePad.clear();
  }

  /*── Power of Attorney Section End ──*/

  /* ════════════════════════════════════════════════════════════════════════════════════════════════*/

  /* ──  Reset Password Section Start ──*/
  /* ══════════════════════════════════════════════════════════════════
  STEP 1 — Password VALIDATION
  ══════════════════════════════════════════════════════════════════ */

  /* ── Password validation flags ──────────────────────────────────── */
  pw_length: boolean = false;
  pw_case: boolean = false;
  pw_special: boolean = false;
  pw_number: boolean = false;
  showPw: boolean = false;
  showRepPw: boolean = false;
  otpError: string = '';
  password: string = '';
  passwordMismatch: boolean = false;
  otpValue: string = '';
  otpInvalid = false;
  newOtp = false;

  validatePassword(password: string, repeat: string) {
    this.password = password;

    this.pw_length = password.length >= 8 && password.length <= 50;
    this.pw_case = /[a-z]/.test(password) && /[A-Z]/.test(password);
    this.pw_special = /[!@\$%\^&\*\+#]/.test(password);
    this.pw_number = /[0-9]/.test(password);

    if (repeat.length > 0) {
      this.passwordMismatch = password !== repeat;
    } else {
      this.passwordMismatch = false;
    }
  }

  private isPasswordValid(): boolean {
    return this.pw_length && this.pw_case && this.pw_special && this.pw_number;
  }

  @ViewChild('countdown', { static: false }) private countdown!: CountdownComponent;

  config: CountdownConfig = {
    leftTime: environment.resendTimer,
    format: 'm:ss',
    demand: false,
  };

  isResendDisabled: boolean = true;

  handleEvent(event: CountdownEvent) {
    if (event.action === 'done') {
      this.isResendDisabled = false;
    }
  }

  /* ══════════════════════════════════════════════════════════════════
  STEP 2 — OTP INPUT HELPERS
  ══════════════════════════════════════════════════════════════════ */

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;
    this.collectOtp();
    this.otpError = '';

    if (val && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (next) next.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      const input = event.target as HTMLInputElement;
      if (!input.value && index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prev) {
          prev.value = '';
          prev.focus();
        }
      }
      this.collectOtp();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
    pasted.split('').forEach((ch, i) => {
      const el = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (el) el.value = ch;
    });
    this.collectOtp();
    const last = document.getElementById(
      `otp-${Math.min(pasted.length - 1, 5)}`,
    ) as HTMLInputElement;
    if (last) last.focus();
  }

  private collectOtp() {
    let val = '';
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(`otp-${i}`) as HTMLInputElement;
      val += el ? el.value || '' : '';
    }
    this.otpValue = val;
  }

  /* ──  Reset Password Section End ──*/
  /* ════════════════════════════════════════════════════════════════════════════════════════════════*/
}
