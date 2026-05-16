import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { Environment, ENVIRONMENT } from '../../environment.token';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration implements OnInit {
  private API_BASE: string;
  private readonly LOCAL_API_BASE = 'http://192.168.0.155:8080';
  currentStep: 'callback' | 'telefon' | 'weekday' | 'time' | 'others' = 'callback';

  goToStep(step: 'callback' | 'telefon' | 'weekday' | 'time' | 'others') {
    this.currentStep = step;
  }
  constructor(
    @Inject(ENVIRONMENT) private env: Environment,
    // private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.API_BASE = env.apiBaseUrl;
  }

  selectedDay: string = '';
  selectedTimeSlot: string = '';
  scheduleDescription: string = '';
  isScheduleLoading = false;
  scheduleErrorMessage = '';
  scheduleSuccessMessage = '';
  overrideStartDay: string | null = null;
  countryCode: string = '+49';
  phoneNumber: string = '';
  fieldErrors: Record<string, string> = {};

  readonly daysOfWeek = [
    { label: 'Montag', value: 'MONDAY' },
    { label: 'Dienstag', value: 'TUESDAY' },
    { label: 'Mittwoch', value: 'WEDNESDAY' },
    { label: 'Donnerstag', value: 'THURSDAY' },
    { label: 'Freitag', value: 'FRIDAY' },
    { label: 'Samstag', value: 'SATURDAY' },
  ];

  readonly timeSlots = [
    { label: '08:00 - 11:00 ', value: '08-11' },
    { label: '11:00 - 14:00', value: '11-14' },
    { label: '14:00 - 17:00', value: '14-17' },
    { label: '17:00 - 20:00', value: '17-20' },
  ];

  /** Maps day enum values to JS Date.getDay() numbers (0=Sun … 6=Sat). */
  private readonly dayValueToJsDay: Record<string, number> = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  availableDays: { date: string; day: string }[] = [];

  ngOnInit(): void {
    this.loadAvailableDays();
  }

  loadAvailableDays(): void {
    const payload = {
      adminId: 1,
    };

    this.http.post<any>(`${this.API_BASE}/customer/list-of-working-days`, payload).subscribe({
      next: (res) => {
        if (res?.res && res?.data) {
          this.availableDays = Object.entries(res.data).map(([date, day]) => ({
            date,
            day: day as string,
          }));

          // console.log('Available Days:', this.availableDays);

          this.setDefaultSelectedDay();
        }
      },

      error: (err) => {
        console.error('Working days fetch error:', err);
      },
    });
  }

  get enabledDays(): Set<string> {
    const now = new Date();

    let todayJs: number;

    if (this.overrideStartDay) {
      todayJs = this.dayValueToJsDay[this.overrideStartDay];
    } else {
      todayJs = now.getDay();
      if (todayJs === 0) todayJs = 1;
    }

    const enabled = new Set<string>();

    for (let i = 0; i < 3; i++) {
      let day = todayJs + i;

      if (day > 6) {
        day = day - 6;
      }

      const entry = Object.entries(this.dayValueToJsDay).find(([, v]) => v === day);

      if (entry) {
        enabled.add(entry[0]);
      }
    }

    return enabled;
  }

  get filteredDays() {
    return this.availableDays
      .map((item) => {
        const found = this.daysOfWeek.find((d) => d.value === item.day);

        return {
          ...found,
          date: item.date,
        };
      })
      .filter(Boolean);
  }

  isDayEnabled(dayValue: string): boolean {
    return this.availableDays.some((d) => d.day === dayValue);
  }

  private setDefaultSelectedDay(): void {
    if (this.filteredDays.length > 0) {
      this.selectedDay = this.filteredDays[0].value ?? '';
    }
  }

  getDayLabelByValue(dayValue: string): string {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

    let todayJs = now.getDay();
    if (todayJs === 0) todayJs = 1;

    const targetJs = this.dayValueToJsDay[dayValue];

    let diff = targetJs - todayJs;
    if (diff < 0) diff += 7;

    if (diff === 0) return 'Heute';
    if (diff === 1) return 'Morgen';
    if (diff === 2) return 'Übermorgen';

    // 🔥 fallback → show date
    return this.formatDateByDayValue(dayValue);
  }
  formatDateByDayValue(dayValue: string): string {
    const dateStr = this.getDateFromDay(dayValue); // already returns YYYY-MM-DD
    const d = new Date(dateStr);

    return d.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    }); // e.g. 10.05
  }
  trackByDay(index: number, item: any) {
    return item.value;
  }

  getSlotTime(slotValue: string): { start: number; end: number } | null {
    const parts = slotValue.split('-');

    if (parts.length !== 2) return null;

    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);

    return { start, end };
  }

  isTimeSlotEnabled(slotValue: string): boolean {
    if (!this.selectedDay) return true;

    const germanNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

    let todayJs = germanNow.getDay();
    if (todayJs === 0) todayJs = 1;

    const selectedJsDay = this.dayValueToJsDay[this.selectedDay];

    // If NOT today → all slots enabled
    if (selectedJsDay !== todayJs) return true;

    const currentHour = germanNow.getHours() + germanNow.getMinutes() / 60;

    const slot = this.getSlotTime(slotValue);
    if (!slot) return false;

    // Disable if slot already started OR less than 2 hours left
    if (currentHour >= slot.start) return false;

    const hoursBeforeStart = slot.start - currentHour;

    return hoursBeforeStart >= 2;
  }

  getDateFromDay(dayValue: string): string {
    const now = new Date();

    const germanNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

    let todayJs = germanNow.getDay();
    if (todayJs === 0) todayJs = 1;

    const targetJsDay = this.dayValueToJsDay[dayValue];

    let diff = targetJsDay - todayJs;

    if (diff < 0) diff += 7;

    const targetDate = new Date(germanNow);
    targetDate.setDate(germanNow.getDate() + diff);

    return targetDate.toISOString().split('T')[0];
  }

  selectDay(day: string): void {
    if (!this.isDayEnabled(day)) return;
    this.selectedDay = day;
    // Clear time slot if it is no longer valid for the newly selected day
    if (this.selectedTimeSlot && !this.isTimeSlotEnabled(this.selectedTimeSlot)) {
      this.selectedTimeSlot = '';
    }
    this.cdr.detectChanges();
  }

  selectTimeSlot(slot: string): void {
    if (!this.isTimeSlotEnabled(slot)) return;
    this.selectedTimeSlot = slot;
    this.cdr.detectChanges();
  }
  onNextPhone() {
    console.log('Phone number entered:', this.phoneNumber);
    if (!this.validatePhone()) return;

    this.goToStep('weekday');
  }

  validatePhone(): boolean {
    let valid = true;
    const errors: any = {};

    const mobile = (this.phoneNumber || '').toString().replace(/\s/g, '');

    if (!mobile) {
      errors['phoneNumber'] = 'Handynummer ist erforderlich.';
      valid = false;
    } else if (!/^\d+$/.test(mobile)) {
      errors['phoneNumber'] = 'Nur Zahlen sind erlaubt.';
      valid = false;
    } else if (mobile.length < 6) {
      errors['phoneNumber'] = 'Mindestens 6 Ziffern erforderlich.';
      valid = false;
      this.cdr.detectChanges();
    } else if (mobile.length > 12) {
      errors['phoneNumber'] = 'Maximal 12 Ziffern erlaubt.';
      valid = false;
      this.cdr.detectChanges();
    }

    this.fieldErrors = errors;
    console.log('Validation errors:', this.fieldErrors);
    this.cdr.detectChanges();

    return valid;
  }
  submitDay(): void {
    this.scheduleErrorMessage = '';
    this.cdr.detectChanges();
    console.log('select day:', this.selectedDay);

    if (!this.selectedDay) {
      this.scheduleErrorMessage = 'Bitte wählen Sie einen Tag und eine Uhrzeit aus.';
      console.log('error', this.scheduleErrorMessage);
      return;
    }

    this.scheduleErrorMessage = '';
    this.scheduleSuccessMessage = '';
    this.isScheduleLoading = true;

    const payload = {
      adminId: 1,
      scheduleDate: this.getDateFromDay(this.selectedDay),
    };

    console.log('Schedule payload:', JSON.stringify(payload, null, 2));

    const submit = (apiBase: string) =>
      this.http.post<any>(`${apiBase}/api/check-holiday`, payload);

    submit(this.API_BASE).subscribe({
      next: (res) => {
        if (res?.res === true) {
          this.isScheduleLoading = false;
          this.goToStep('time');
          this.cdr.detectChanges();
        } else if (res?.res === false && res?.holidayDated?.length) {
          this.isScheduleLoading = false;
          this.overrideStartDay = res.nextDay;
          this.selectedDay = '';

          const holidayDates = res.holidayDated.map((d: string) => this.formatDateDE(d)).join(', ');

          const firstNextDate = res.nextDate?.[0] ? this.formatDateDE(res.nextDate[0]) : '';
          const nextDay = this.getNextDayLabel(res.nextDay);

          this.scheduleErrorMessage =
            `Der ausgewählte Termin ist ein Urlaubstag. ` +
            `Bitte wählen Sie einen Termin ab dem ${firstNextDate} (${nextDay}).`;
          this.cdr.detectChanges();
        } else {
          this.isScheduleLoading = false;
          this.scheduleErrorMessage =
            res.errorMessage || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        submit(this.LOCAL_API_BASE).subscribe({
          next: () => {
            this.isScheduleLoading = false;

            this.cdr.detectChanges();
          },
          error: (err2) => {
            this.isScheduleLoading = false;
            this.scheduleErrorMessage =
              err2?.error?.message ||
              err?.error?.message ||
              'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
            console.error('Add-schedule API error:', err, err2);
            this.cdr.detectChanges();
          },
        });
        this.cdr.detectChanges();
      },
    });
  }

  getNextDayLabel(dayValue: string): string {
    const found = this.daysOfWeek.find((d) => d.value === dayValue);
    return found ? found.label : dayValue;
  }

  formatDateDE(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE'); // 01.05.2026
  }

  submitCallback() {
    if (!this.phoneNumber || !this.selectedDay || !this.selectedTimeSlot) {
      this.scheduleErrorMessage = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      return;
    }
    if (!this.scheduleDescription || !this.scheduleDescription.trim()) {
      this.scheduleErrorMessage = 'Bitte geben Sie zusätzliche Informationen ein.';
      return;
    }

    this.isScheduleLoading = true;
    this.scheduleErrorMessage = '';
    this.scheduleSuccessMessage = '';

    const payload = {
      mobileNumber: this.countryCode + this.phoneNumber,
      day: this.selectedDay,
      scheduleDate: this.getDateFromDay(this.selectedDay),
      weekDay: this.selectedDay,
      timeSlot: this.selectedTimeSlot,
      description: this.scheduleDescription,
      customerId: this.authService.getUserId() || 0,
      adminId: 1,
    };

    console.log('Final Payload:', payload);

    const submit = (apiBase: string) =>
      this.http.post<any>(`${apiBase}/api/add-counselling-request`, payload);

    submit(this.API_BASE).subscribe({
      next: (res) => {
        this.isScheduleLoading = false;

        if (res?.res === true) {
          this.scheduleSuccessMessage = 'Ihr Rückruf wurde erfolgreich geplant.';

          this.phoneNumber = '';
          this.selectedDay = '';
          this.selectedTimeSlot = '';
          this.scheduleDescription = '';
          setTimeout(() => {
            this.goToStep('callback');
            this.cdr.detectChanges();
          }, 3000);
        } else {
          this.scheduleErrorMessage =
            res?.message || 'Fehler beim Speichern. Bitte erneut versuchen.';
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        submit(this.LOCAL_API_BASE).subscribe({
          next: (res2) => {
            this.isScheduleLoading = false;
            this.scheduleSuccessMessage = 'Ihr Rückruf wurde erfolgreich geplant.';
            this.cdr.detectChanges();
          },
          error: (err2) => {
            this.isScheduleLoading = false;
            this.scheduleErrorMessage =
              err2?.error?.message ||
              err?.error?.message ||
              'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
            console.error('API error:', err, err2);
            this.cdr.detectChanges();
          },
        });
      },
    });
  }
}
