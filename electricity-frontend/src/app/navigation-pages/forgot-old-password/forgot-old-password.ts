import { ChangeDetectorRef, Component, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const API_BASE = 'http://192.168.0.155:8080';
@Component({
  selector: 'app-forgot-old-password',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ContactPerson,
    NeedSupport,
  ],
  templateUrl: './forgot-old-password.html',
  styleUrl: './forgot-old-password.css',
})
export class ForgotOldPassword {
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  fieldErrors: Record<string, string> = {};
  pw_length: boolean = false;
  pw_case: boolean = false;
  pw_special: boolean = false;
  pw_number: boolean = false;
  showPw: boolean = false;
  showRepPw: boolean = false;
  otpError: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;

  isLoadingReset: boolean = false;
  apiError: string = '';
  token: string = '';
  submitted: boolean = false;

  clearPwdField() {
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPw = false;
    this.showRepPw = false;
    this.passwordMismatch = false;
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];

      console.log('Token:', this.token);
    });
  }
  validatePassword(password: string, repeat: string) {
    this.newPassword = password;

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

  private validateStepReset(passwordRepeat: string): boolean {
    this.fieldErrors = {};
    let valid = true;

    if (!this.newPassword) {
      this.fieldErrors['newPassword'] = 'Ein neues Passwort ist erforderlich.';
      valid = false;
    } else if (!this.isPasswordValid()) {
      this.fieldErrors['newPassword'] = 'Passwort erfüllt nicht alle Anforderungen.';
      valid = false;
    }

    if (this.newPassword !== passwordRepeat) {
      this.passwordMismatch = true;
      valid = false;
    }

    return valid;
  }

  resetPassword() {
    this.apiError = '';

    const isValid = this.validateStepReset(this.confirmPassword);

    if (!isValid) {
      console.log('not valid');
      return;
    }
    this.isLoadingReset = true;

    this.http
      .post<{
        res: boolean;
        message: string;
        errMessage: string;
      }>(`${API_BASE}/auth/change-password-mail`, {
        token: this.token,
        password: this.newPassword,
        confirmPassword: this.confirmPassword,
        adminId: 1,
      })
      .subscribe({
        next: (res) => {
          this.isLoadingReset = false;

          if (res.res) {
            this.clearPwdField();
            this.submitted = true;
          } else {
            console.log('false going');
            console.log('error message', res.errMessage);

            this.apiError =
              'Ihr Link zum Zurücksetzen ist abgelaufen. Bitte fordern Sie eine neue E-Mail an.';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoadingReset = false;
          this.apiError =
            err?.error?.message || 'Fehler beim Zurücksetzen. Bitte erneut versuchen.';
        },
      });
  }
}
