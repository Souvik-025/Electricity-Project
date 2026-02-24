import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-car-electricity',
  imports: [MatIconModule, CommonModule],
  templateUrl: './car-electricity.html',
  styleUrl: './car-electricity.css',
})
export class CarElectricity {
  selectedOption: 'ja' | 'nein' = 'ja';

  showNoBanner = false;

  select(option: 'ja' | 'nein') {
    this.selectedOption = option;

  if (option === 'nein') {
    this.showNoBanner = true;
    } else {
      this.showNoBanner = false;
    }
  }

  closeNoBanner() {
    this.showNoBanner = false;
    this.selectedOption = 'ja'; // switches to JA view when X is clicked
  }

}
