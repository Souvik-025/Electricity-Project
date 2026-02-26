import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-car-electricity',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatDialogModule],
  templateUrl: './car-electricity.html',
  styleUrl: './car-electricity.css',
})
export class CarElectricity {

  constructor(public dialog: MatDialog) {}

  selectedOption: 'ja' | 'nein' = 'ja';
  activeInfo: 'ladestrom' | 'discountinfo' | null = null;
  showNoBanner = false;

  ladestrom = `Um Ihnen den passenden Ladestromtarif für Ihr E-Auto anbieten zu können, ist es wichtig,
    Informationen zu Ihrem Zähler zu erhalten. Bei einem bereits installierten eigenen Ladestromzähler können geringere Netzentgelte erhoben werden. Der Zähler muss dafür den technischen Anforderungen einer steuerbaren Verbrauchseinheit
    genügen und bei Ihrem Netzbetreiber registriert werden. Bei einem gemeinsamen Zähler für Haushalt und E-Auto können Sie sogenannte Kombitarife nutzen.`;

  discountinfo = `need to add text`;

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

  currentDialogText = '';

  openInfo(template: any, text: string) {
    this.currentDialogText = text;

    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
  }

}
