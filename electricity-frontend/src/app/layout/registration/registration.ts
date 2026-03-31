import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-registration',
  imports: [CommonModule],
  templateUrl: './registration.html',
  styleUrl: './registration.css',
})
export class Registration {

  currentStep: 'callback' | 'telefon' | 'weekday' | 'time' | 'others'  = 'callback';

  goToStep(step: 'callback' | 'telefon' | 'weekday' | 'time' | 'others') {
    this.currentStep = step;
  }

}
