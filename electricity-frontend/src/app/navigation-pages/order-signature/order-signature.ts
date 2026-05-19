import { ChangeDetectorRef, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import SignaturePad from 'signature_pad';

import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
const API_BASE = 'http://192.168.0.155:8080';
@Component({
  selector: 'app-order-signature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ContactPerson,
    NeedSupport,
  ],
  templateUrl: './order-signature.html',
  styleUrl: './order-signature.css',
})
export class OrderSignature {
  @ViewChildren('canvas')
  canvasRefs!: QueryList<ElementRef<HTMLCanvasElement>>;

  signaturePads: SignaturePad[] = [];

  currentStep: number = 0;
  token: string = '';

  contractDetails: any;
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  // CHECKBOX VALUES
  acceptAgb: boolean = false;
  acceptWiderruf: boolean = false;
  // CHECKBOX VALUES
  consentGeneral: boolean = false;
  consentPhone: boolean = false;
  consentMobile: boolean = false;
  consentEmail: boolean = false;
  // VALIDATION ERRORS
  agbError: boolean = false;
  widerrufError: boolean = false;
  signatureError: boolean = false;

  // STORED SIGNATURES
  storedSignatures: any = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];

      console.log('Token:', this.token);

      if (this.token) {
        this.fetchContractDetails();
      }
    });
  }

  fetchContractDetails(): void {
    this.http
      .post<any>(`${API_BASE}/api/fetch-contract-details`, {
        token: this.token,
      })
      .subscribe({
        next: (res) => {
          console.log('Contract Details:', res);
          this.contractDetails = res.data;
          this.submitted = res.submitted;
          console.log('Contract Details:', this.contractDetails);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  navigateToMainStep(step: number): void {
    if (step < 0 || step > 4) return;

    this.currentStep = step;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      this.initializeSignaturePads();
    }, 0);
  }

  initializeSignaturePads(): void {
    this.signaturePads = [];

    this.canvasRefs.forEach((canvasRef, index) => {
      const canvas = canvasRef.nativeElement;

      canvas.width = canvas.offsetWidth;
      canvas.height = 220;

      const pad = new SignaturePad(canvas, {
        minWidth: 1,
        maxWidth: 2.5,
        penColor: '#000',
        backgroundColor: '#ffffff',
      });

      this.signaturePads[index] = pad;
    });

    // IMPORTANT
    requestAnimationFrame(() => {
      this.restoreStepData();
    });
  }

  restoreStepData(): void {
    // STEP 1
    if (this.currentStep === 1 && this.storedSignatures.step1) {
      this.acceptAgb = this.storedSignatures.step1.acceptAgb;
      this.acceptWiderruf = this.storedSignatures.step1.acceptWiderruf;

      if (this.storedSignatures.step1.signature && this.signaturePads[0]) {
        this.signaturePads[0].fromDataURL(this.storedSignatures.step1.signature);
      }
    }

    // STEP 2
    if (this.currentStep === 2 && this.storedSignatures.step2) {
      if (this.storedSignatures.step2.signature && this.signaturePads[0]) {
        this.signaturePads[0].fromDataURL(this.storedSignatures.step2.signature);
      }
    }

    // STEP 3
    if (this.currentStep === 3 && this.storedSignatures.step3) {
      if (this.storedSignatures.step3.partnerSignature && this.signaturePads[0]) {
        this.signaturePads[0].fromDataURL(this.storedSignatures.step3.partnerSignature);
      }

      if (this.storedSignatures.step3.customerSignature && this.signaturePads[1]) {
        this.signaturePads[1].fromDataURL(this.storedSignatures.step3.customerSignature);
      }
    }

    // STEP 4
    if (this.currentStep === 4 && this.storedSignatures.step4) {
      this.consentGeneral = this.storedSignatures.step4.consentGeneral;
      this.consentPhone = this.storedSignatures.step4.consentPhone;
      this.consentMobile = this.storedSignatures.step4.consentMobile;
      this.consentEmail = this.storedSignatures.step4.consentEmail;

      if (this.storedSignatures.step4.signature && this.signaturePads[0]) {
        this.signaturePads[0].fromDataURL(this.storedSignatures.step4.signature);
      }
    }
  }

  clearSignature(index: number): void {
    if (this.signaturePads[index]) {
      this.signaturePads[index].clear();
    }
  }

  saveSignature(index: number): void {
    const pad = this.signaturePads[index];

    if (!pad || pad.isEmpty()) {
      alert('Bitte unterschreiben Sie zuerst');
      return;
    }

    const signatureData = pad.toDataURL();

    console.log('Signature:', signatureData);
  }

  isActiveStep(step: number): boolean {
    return this.currentStep === step;
  }

  nextStep(step: number): void {
    // STEP 1
    if (this.currentStep === 1) {
      if (!this.validateStep1()) {
        return;
      }

      this.storedSignatures.step1 = {
        signature: this.signaturePads[0].toDataURL(),
        acceptAgb: this.acceptAgb,
        acceptWiderruf: this.acceptWiderruf,
      };
    }

    // STEP 2
    if (this.currentStep === 2) {
      if (!this.validateStep2()) {
        return;
      }

      this.storedSignatures.step2 = {
        signature: this.signaturePads[0].toDataURL(),
      };
    }

    // STEP 3
    if (this.currentStep === 3) {
      if (!this.validateStep3()) {
        return;
      }

      this.storedSignatures.step3 = {
        partnerSignature: this.signaturePads[0].toDataURL(),
        customerSignature: this.signaturePads[1].toDataURL(),
      };
    }

    // STEP 4
    if (this.currentStep === 4) {
      if (!this.validateStep4()) {
        return;
      }

      this.storedSignatures.step4 = {
        signature: this.signaturePads[0].toDataURL(),
      };

      console.log('ALL STORED DATA:', this.storedSignatures);

      return;
    }

    this.currentStep = step;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setTimeout(() => {
      this.initializeSignaturePads();
    }, 0);
  }
  canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(
          new File([blob!], 'signature.png', {
            type: 'image/png',
          }),
        );
      }, 'image/png');
    });
  }

  async submitFinalForm(): Promise<void> {
    if (!this.validateStep4()) {
      return;
    }

    // STORE STEP 4 SIGNATURE
    this.storedSignatures.step4 = {
      signature: this.signaturePads[0].toDataURL(),
      consentGeneral: this.consentGeneral,
      consentPhone: this.consentPhone,
      consentMobile: this.consentMobile,
      consentEmail: this.consentEmail,
    };

    const formData = new FormData();

    formData.append('data', this.token);

    // CONVERT STORED SIGNATURES TO FILES
    const step1File = await this.base64ToFile(this.storedSignatures.step1.signature);

    const step2File = await this.base64ToFile(this.storedSignatures.step2.signature);

    const step3CustomerFile = await this.base64ToFile(
      this.storedSignatures.step3.customerSignature,
    );

    const step4File = await this.base64ToFile(this.storedSignatures.step4.signature);

    // APPEND FILES
    formData.append('signature', step1File);

    formData.append('signatureBank', step2File);

    formData.append('signatureCustomer', step3CustomerFile);

    formData.append('signatureDataProtection', step4File);

    this.http.post(`${API_BASE}/customer/add-contract-signature`, formData).subscribe({
      next: (res) => {
        console.log('Success:', res);

        this.submitted = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  base64ToFile(base64: string): Promise<File> {
    return fetch(base64)
      .then((res) => res.blob())
      .then((blob) => {
        return new File([blob], 'signature.png', {
          type: 'image/png',
        });
      });
  }

  fieldErrors: Record<string, string> = {};

  validateStep1(): boolean {
    let isValid = true;

    // AGB
    if (!this.acceptAgb) {
      this.fieldErrors['acceptAgb'] = 'Bitte akzeptieren Sie die AGB.';
      isValid = false;
    } else {
      delete this.fieldErrors['acceptAgb'];
    }

    // Widerruf
    if (!this.acceptWiderruf) {
      this.fieldErrors['acceptWiderruf'] = 'Bitte akzeptieren Sie die Widerrufsbelehrung.';
      isValid = false;
    } else {
      delete this.fieldErrors['acceptWiderruf'];
    }

    // Signature
    const pad = this.signaturePads[0];

    if (!pad || pad.isEmpty()) {
      this.fieldErrors['signature'] = 'Bitte unterschreiben Sie zuerst.';
      isValid = false;
    } else {
      delete this.fieldErrors['signature'];
    }

    return isValid;
  }

  validateStep2(): boolean {
    let isValid = true;

    const pad = this.signaturePads[0];

    if (!pad || pad.isEmpty()) {
      this.fieldErrors['step2Signature'] = 'Bitte unterschreiben Sie zuerst.';
      isValid = false;
    } else {
      delete this.fieldErrors['step2Signature'];
    }

    return isValid;
  }

  validateStep3(): boolean {
    let isValid = true;

    // Vertriebspartner signature
    const partnerPad = this.signaturePads[0];

    if (!partnerPad || partnerPad.isEmpty()) {
      this.fieldErrors['step3PartnerSignature'] = 'Bitte Vertriebspartner-Unterschrift hinzufügen.';
      isValid = false;
    } else {
      delete this.fieldErrors['step3PartnerSignature'];
    }

    // Customer signature
    const customerPad = this.signaturePads[1];

    if (!customerPad || customerPad.isEmpty()) {
      this.fieldErrors['step3CustomerSignature'] = 'Bitte Kunden-Unterschrift hinzufügen.';
      isValid = false;
    } else {
      delete this.fieldErrors['step3CustomerSignature'];
    }

    return isValid;
  }

  validateStep4(): boolean {
    this.fieldErrors = {};

    let isValid = true;

    // CHECK ALL CHECKBOXES
    if (!this.consentGeneral || !this.consentPhone || !this.consentMobile || !this.consentEmail) {
      this.fieldErrors['step4Consent'] = 'Bitte alle Einwilligungen bestätigen';
      isValid = false;
    }

    // SIGNATURE VALIDATION
    const pad = this.signaturePads[0];

    if (!pad || pad.isEmpty()) {
      this.fieldErrors['step4Signature'] = 'Bitte unterschreiben Sie';
      isValid = false;
    }

    return isValid;
  }
}
