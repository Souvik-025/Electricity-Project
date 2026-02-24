import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-compare-prices',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './compare-prices.html',
  styleUrl: './compare-prices.css',
})
export class ComparePrices {
  consumption = 2510; // default value

  setConsumption(value: number) {
    this.consumption = value;
  }

  selectedPersons = 2;

  selectPersons(persons: number, value: number) {
    this.selectedPersons = persons;
    this.consumption = value;
  }
}
