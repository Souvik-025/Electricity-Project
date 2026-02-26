import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-discount',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatToolbarModule, MatFormFieldModule, MatInputModule, CommonModule, MatTooltipModule],
  templateUrl: './discount.html',
  styleUrl: './discount.css',
})
export class Discount {

  activeInfo: 'ansprechpartner' | 'vergleich' | 'wechselerinnerung' | null = null;

  ansprechpartner = `SERVICE wird bei uns GROß geschrieben!
    Deshalb erhält jeder unserer Kunden einen dauerhaft festen Ansprechpartner.
    Dieser steht Ihnen für alle Fragen Rund um Ihre Verträge jederzeit gerne zur Seite.
    Er unterstützt Sie sowohl beim Anbieterwechsel, als auch bei Zählerstandsmeldungen oder Allgemeinen Fragen.
    Auch werden Sie durch Ihren persönlichen Ansprechpartner rechtzeitig an den nächsten Wechsel erinnert.

    PERSÖNLICH - FAIR - KOMPETENT:
    Im Anschluss Ihrer Eingabe zum Anbieterwechsel, erhalten Sie direkten Kontaktdaten Ihres persönlichen Ansprechpartners (wie E-Mail Adresse, Durchwahl und sogar die Handynummer).`;

  vergleich = `need the text here`;

  wechselerinnerung = `
    Mit unserer automatischen Wechselerinnerung verpassen Sie keine Kündigungsfristen mehr.
    Ihr persönlicher Ansprechpartner erinnert Sie rechtzeitig vor Ablauf Ihrer Mindestvertragslaufzeit über das anstehende Ende der Mindestlaufzeit und bereitet für Sie direkt passende Anschlusskonditionen vor.
    Somit vermeiden Sie Preiserhöhungen und sichern sich wieder die besten Konditionen.
    `;
}
