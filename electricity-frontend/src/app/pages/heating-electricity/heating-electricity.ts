import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';


export interface SingelDoubleMeter {
  singleTariff:'',
  doubleTariff: '',
  singleImage: '',
  doubleImage: '',
  singleDescription: '',
  doubleDescription: ''
}

export interface InfoDialogData {
  title: string;
  image: string;
  description: string;
}

@Component({
  selector: 'app-heating-electricity',
  imports: [CommonModule, MatIconModule, MatDialogModule, RouterModule],
  templateUrl: './heating-electricity.html',
  styleUrl: './heating-electricity.css',
})


export class HeatingElectricity {
  selectedOption: 'ja' | 'nein' = 'ja';
  selectedTariff: 'single' | 'double' = 'single';
  showNoBanner = false;
  activeInfo: 'doubletariff' | null = null;

  currentDialogData: InfoDialogData[] = [];

  constructor(public dialog: MatDialog) {}

  doubletariff = `Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
  Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).
  Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein
  Verbrauchswert zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung`;


  singleDoubleMeter = {
    singleTariff:'Eintarifzähler ermitteln den Verbrauch von Strom.',

    doubleTariff: `Eintarifzähler ermitteln den Verbrauch von Strom.`,

    singleImage: '/assets/images/single_meter.png',
    doubleImage: '/assets/images/double_meter.png',
    singleDescription:`Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
        Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).`,
    doubleDescription:
      `Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein Verbrauchswert
      zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung gestellt.`,
  };

  noticeParagraphs: string[] = [
    'Bitte beachten Sie, dass für den Abschluss eines Wärmepumpentarifs ein separater Zähler erforderlich ist.',
    'Falls Sie keinen separaten Zähler für Ihre Wärmepumpe haben, nutzen Sie bitte unseren Stromvergleich für den gesamten Haushalt.'
  ];


  select(option: 'ja' | 'nein') {
    this.selectedOption = option;

  if (option === 'nein') {
    this.selectedTariff = 'single';
    this.showNoBanner = true;
    } else {
      this.showNoBanner = false;
    }
  }

  closeNoBanner() {
    this.showNoBanner = false;
    this.selectedOption = 'ja'; // switches to JA view when X is clicked
  }

  tariff(type: 'single' | 'double') {
    this.selectedTariff = type;
  }

  openSingleDoubleMeter(template: any) {
    this.currentDialogData = [
      {
        title: this.singleDoubleMeter.singleTariff,
        image: this.singleDoubleMeter.singleImage,
        description: this.singleDoubleMeter.singleDescription,
      },
      {
        title: this.singleDoubleMeter.doubleTariff,
        image: this.singleDoubleMeter.doubleImage,
        description: this.singleDoubleMeter.doubleDescription,
      },
    ];
    this.dialog.open(template, { width: '470px', maxWidth: '80vw' });
  }



}
