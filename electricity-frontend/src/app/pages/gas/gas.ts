import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gas',
  imports: [MatIconModule],
  templateUrl: './gas.html',
  styleUrl: './gas.css',
})
export class Gas {
  consumption = 18000; // default value

  setConsumption(value: number) {
    this.consumption = value;
  }

  selectedPersons = 3;

  selectPersons(persons: number, value: number) {
    this.selectedPersons = persons;
    this.consumption = value;
  }
}
