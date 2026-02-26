import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';


export interface SingelDoubleMeter {
  singleTariff:'',
  doubleTariff: '',
  singleImage: '',
  doubleImage: '',
  singleDescription: '',
  doubleDescription: ''
}

export interface NightStorageHeaters {
  description1:'',
  description2: ''
}

export interface InfoDialogData {
  title?: string;
  image?: string;
  description: string;
}

@Component({
  selector: 'app-night-heaters',
  imports: [MatIconModule, CommonModule, MatDialogModule],
  templateUrl: './night-heaters.html',
  styleUrl: './night-heaters.css',
})


export class NightHeaters {

  selectedOption: 'ja' | 'nein' = 'ja';
  selectedTariff: 'single' | 'double' = 'single';
  activeInfo: 'eintarif' | 'heizstrom' | null = null;

  currentDialogData: InfoDialogData[] = [];

  constructor(public dialog: MatDialog) {}


  eintarif = `Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
  Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).
  Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein Verbrauchswert
  zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung`;

  heizstrom = `Der Stromverbrauch von Nachtspeicherheizungen wird in der Regel mit einem eigenen separaten Stromzähler gemessen. Ist dies auch bei Ihnen der Fall,
  finden Sie in Ihrem Keller zwei Zähler vor: einen für Heizstrom und einen weiteren für den üblichen Haushaltsstrom.

  Bei einigen älteren Nachtspeicherheizungen wird Haushaltsstrom und Heizstrom noch gemeinsam gemessen, es gibt also nur einen Stromzähler für beide Arten von Verbräuchen.`;


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

  nightStorageHeaters = {
    description1: `Der Stromverbrauch von Nachtspeicherheizungen wird in der Regel mit einem eigenen separaten Stromzähler gemessen. Ist dies auch bei Ihnen der Fall,
  finden Sie in Ihrem Keller zwei Zähler vor: einen für Heizstrom und einen weiteren für den üblichen Haushaltsstrom.`,
    description2: `Bei einigen älteren Nachtspeicherheizungen wird Haushaltsstrom und Heizstrom noch gemeinsam gemessen, es gibt also nur einen Stromzähler für beide Arten von Verbräuchen.`,
  };



  select(option: 'ja' | 'nein') {
    this.selectedOption = option;

    if (option === 'nein') {
      this.selectedTariff = 'single';
    }

  }

  tariff(type: 'single' | 'double') {
    this.selectedTariff = type;
  }

  openNightStorage(template: any) {
    this.currentDialogData = [
      {
        description: this.nightStorageHeaters.description1,
      },
      {
        description: this.nightStorageHeaters.description2,
      },
    ];
    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
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
