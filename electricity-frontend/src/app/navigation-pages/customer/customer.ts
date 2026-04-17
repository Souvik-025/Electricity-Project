import { Component } from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';

@Component({
  selector: 'app-customer',
  imports: [
    ContactPerson
  ],
  templateUrl: './customer.html',
  styleUrl: './customer.css',
})

export class Customer {

}
