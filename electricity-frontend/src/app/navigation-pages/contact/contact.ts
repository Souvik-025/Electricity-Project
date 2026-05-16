import { Component } from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';

@Component({
  selector: 'app-contact',
  imports: [ContactPerson, NeedSupport],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {}
