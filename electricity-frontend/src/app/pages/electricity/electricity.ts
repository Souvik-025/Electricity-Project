import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-electricity',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, MatFormFieldModule, MatInputModule, CommonModule],
  templateUrl: './electricity.html',
  styleUrl: './electricity.css',
})
export class Electricity {
  consumption = 2510; // default value
    activeInfo: 'discountinfo' | null = null;


    discountinfo = `So haben wir gerechnet
      Wohnort: Dortmund, 44141
      Jahresverbrauch: 4.000 kWh
      Günstigster Tarif: immergrün! Spar Smart FairMax, Kosten im ersten Jahr: 920,84 Euro
      Grundversorgungstarif: Dortmunder Energie- und Wasserversorgung GmbH Unser Strom.standard, Kosten: 1.828,72 Euro
      Einsparung: 907,88 Euro
      (Stand: 16.02.2026)`

    setConsumption(value: number) {
      this.consumption = value;
    }

    selectedPersons = 2;

    selectPersons(persons: number, value: number) {
      this.selectedPersons = persons;
      this.consumption = value;
    }
}
