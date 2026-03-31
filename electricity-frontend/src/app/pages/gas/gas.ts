import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { debounceTime, switchMap, of } from 'rxjs';
import { AddressService } from './../../services/address.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Registration } from "../../layout/registration/registration";

@Component({
  selector: 'app-gas',
  imports: [MatIconModule, CommonModule, MatDialogModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatAutocompleteModule, Registration],
  templateUrl: './gas.html',
  styleUrl: './gas.css',
})
export class Gas implements OnInit {

  addressForm!: FormGroup;
  cityOptions: string[] = [];
  streetOptions: string[] = [];

  constructor(public dialog: MatDialog,
    private fb: FormBuilder,
    private addressService: AddressService
  ) {}

  discountinfo = `<p> <strong> So haben wir gerechnet </strong> </p>
      <p> Wohnort: <i> Dortmund, 44141 </i>
       Jahresverbrauch: <i> 4.000 kWh </i> </p>
      <p> Günstigster Tarif: immergrün! Spar Smart FairMax, Kosten im ersten Jahr: 920,84 Euro </p>
      <p> Grundversorgungstarif: Dortmunder Energie- und Wasserversorgung GmbH Unser Strom.standard, Kosten: 1.828,72 Euro </p>
      <p><strong>Einsparung: 907,88 Euro</strong> <p>
      <p>(Stand: 16.02.2026) </p> `;

  selectedPersons = 3;
  consumption = 20500;
  activeInfo: 'discountinfo' | null = null;


  ngOnInit(): void {
  this.addressForm = this.fb.group({
      postalCode: ['', [
        Validators.required,
        Validators.pattern(/^\d{5}$/)
      ]],

      city: [{ value: '', disabled: true }, Validators.required],

      street: [{ value: '', disabled: true }, Validators.required],

      houseNumber: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.maxLength(6),
        Validators.pattern(/^[a-zA-Z0-9\s\/]*$/)
      ]]
    });

    this.handlePostalCodeChanges();
    this.handleCityChanges();
    this.handleStreetChanges();
  }

  private handlePostalCodeChanges() {
    this.addressForm.get('postalCode')?.valueChanges
      .pipe(
        debounceTime(400),
        switchMap(zip => {

          this.resetCity();
          this.resetStreet();
          this.resetHouseNumber();

          if (this.addressForm.get('postalCode')?.valid) {
            return this.addressService.getCitiesByZipcode(zip);
          }

          return of([]);
        })
      )
      .subscribe(cities => {
        this.cityOptions = cities;
        if (cities.length > 0) {
          this.addressForm.get('city')?.enable();
        }
      });
  }

  private handleCityChanges() {
    this.addressForm.get('city')?.valueChanges.subscribe(city => {

      this.resetStreet();
      this.resetHouseNumber();

      if (city) {
        const zip = this.addressForm.get('postalCode')?.value;

        this.addressService.getStreetsByZip(zip)
          .subscribe(streets => {
            this.streetOptions = streets;
            if (streets.length > 0) {
              this.addressForm.get('street')?.enable();
            }
          });
      }
    });
  }

  private handleStreetChanges() {
    this.addressForm.get('street')?.valueChanges.subscribe(street => {

      this.resetHouseNumber();

      if (street) {
        this.addressForm.get('houseNumber')?.enable();
      }
    });
  }

  private resetCity() {
    this.cityOptions = [];
    this.addressForm.get('city')?.reset();
    this.addressForm.get('city')?.disable();
  }

  private resetStreet() {
    this.streetOptions = [];
    this.addressForm.get('street')?.reset();
    this.addressForm.get('street')?.disable();
  }

  private resetHouseNumber() {
    this.addressForm.get('houseNumber')?.reset();
    this.addressForm.get('houseNumber')?.disable();
  }




   setConsumption(value: number) {
    this.consumption = value;
  }

  selectPersons(persons: number, value: number) {
    this.selectedPersons = persons;
    this.consumption = value;
  }


  currentDialogText = '';

  openInfo(template: any, text: string) {
    this.currentDialogText = text;

    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
  }
}
